/**
 * Report Export Route (Hono)
 *
 * `POST /export` with `{ format: 'csv'|'xlsx'|'pdf', title, columns, rows }`
 * renders the tabular report server-side and streams the file back with a
 * download disposition. Mount under the authenticated `/api` scope — reports
 * expose business data.
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';
import {
  renderReport,
  reportFilename,
  REPORT_CONTENT_TYPES,
  type ReportFormat,
  type ReportTable,
} from '@almadar/server';

const app = new Hono();

app.post('/export', async (c) => {
  const body = await c.req.json<{ format?: string; title?: string; columns?: ReportTable['columns']; rows?: ReportTable['rows'] }>();
  const format = body.format as ReportFormat;
  if (!['csv', 'xlsx', 'pdf'].includes(format)) {
    return c.json({ error: `format must be csv, xlsx, or pdf (got ${body.format ?? 'nothing'})` }, 400);
  }
  if (!Array.isArray(body.columns) || body.columns.length === 0 || !Array.isArray(body.rows)) {
    return c.json({ error: 'columns (non-empty) and rows arrays are required' }, 400);
  }

  const table: ReportTable = {
    title: body.title || 'Report',
    columns: body.columns,
    rows: body.rows,
  };
  const file = await renderReport(format, table);
  return c.body(new Uint8Array(file), 200, {
    'Content-Type': REPORT_CONTENT_TYPES[format],
    'Content-Disposition': `attachment; filename="${reportFilename(table.title, format)}"`,
  });
});

export { app as reportsRouter };
