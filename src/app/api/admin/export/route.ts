/**
 * Data Export API Endpoint
 * @rule 060 "API standards for data export operations"
 * @rule 009 "Security and privacy for data anonymization"
 * @rule 130 "Error handling for export operations"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { hashEmail } from '@/lib/crypto';
import ExcelJS from 'exceljs';

const ExportSchema = z.object({
  format: z.enum(['excel', 'csv'], { errorMap: () => ({ message: 'Format must be excel or csv' }) }),
  filters: z.object({
    groups: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    }).optional(),
    includePartial: z.boolean().default(false),
  }).optional(),
  anonymize: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Processing data export request');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session || session.type !== 'admin') {
      console.log('❌ Unauthorized export attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = ExportSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ Export validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid export parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { format, filters, anonymize, includeMetadata } = validation.data;

    // Build query filters
    const where: any = {};
    
    if (filters?.groups && filters.groups.length > 0) {
      where.group = { in: filters.groups };
    }
    
    if (filters?.dateRange) {
      where.submittedAt = {};
      if (filters.dateRange.start) {
        where.submittedAt.gte = new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        where.submittedAt.lte = new Date(filters.dateRange.end);
      }
    }
    
    if (!filters?.includePartial) {
      where.partial = false;
    }

    // Fetch survey responses with version data
    const responses = await prisma.surveyResponse.findMany({
      where,
      include: {
        version: {
          select: {
            version: true,
            group: true,
            description: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    console.log(`📋 Found ${responses.length} responses for export`);

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found matching the specified criteria' },
        { status: 404 }
      );
    }

    // Process and anonymize data
    const processedData = responses.map(response => {
      const baseData = {
        participantId: anonymize ? hashEmail(response.email) : response.email,
        group: response.group,
        surveyVersion: response.version.version,
        submittedAt: response.submittedAt.toISOString(),
        isPartial: response.partial,
        ...response.responses, // Spread individual question responses
      };

      if (includeMetadata) {
        return {
          ...baseData,
          completionTime: response.completionTime,
          deviceType: response.deviceType,
          submissionDate: response.submittedAt.toLocaleDateString(),
          submissionTime: response.submittedAt.toLocaleTimeString(),
        };
      }

      return baseData;
    });

    // Generate export file
    if (format === 'excel') {
      const buffer = await generateExcelExport(processedData, {
        anonymized: anonymize,
        includeMetadata,
        filters: filters || {},
      });

      const filename = `survey_responses_${new Date().toISOString().split('T')[0]}.xlsx`;

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // CSV format
      const csv = generateCSVExport(processedData);
      const filename = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

  } catch (error) {
    console.error('❌ Export generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

/**
 * Generates Excel export with multiple sheets
 */
async function generateExcelExport(
  data: any[], 
  options: { anonymized: boolean; includeMetadata: boolean; filters: any }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Metadata sheet
  const metadataSheet = workbook.addWorksheet('Export Info');
  metadataSheet.addRows([
    ['Export Generated', new Date().toISOString()],
    ['Total Responses', data.length],
    ['Anonymized', options.anonymized ? 'Yes' : 'No'],
    ['Include Metadata', options.includeMetadata ? 'Yes' : 'No'],
    ['Filters Applied', JSON.stringify(options.filters)],
  ]);

  // Responses sheet
  const responsesSheet = workbook.addWorksheet('Survey Responses');
  
  if (data.length > 0) {
    // Add headers
    const headers = Object.keys(data[0]);
    responsesSheet.addRow(headers);
    
    // Style header row
    const headerRow = responsesSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' }, // Primary color
    };
    
    // Add data rows
    data.forEach(row => {
      responsesSheet.addRow(Object.values(row));
    });
    
    // Auto-fit columns
    responsesSheet.columns.forEach(column => {
      if (column.header) {
        column.width = Math.max(column.header.toString().length + 2, 15);
      }
    });
  }

  // Group summary sheet
  const summarySheet = workbook.addWorksheet('Group Summary');
  const groupCounts = data.reduce((acc, item) => {
    acc[item.group] = (acc[item.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  summarySheet.addRow(['Group', 'Response Count']);
  Object.entries(groupCounts).forEach(([group, count]) => {
    summarySheet.addRow([group, count]);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generates CSV export
 */
function generateCSVExport(data: any[]): string {
  if (data.length === 0) {
    return 'No data available';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}
