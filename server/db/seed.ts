import { db } from "./connection";
import { INITIAL_REPORTS } from "../../src/data/initialData";
import type { Report } from "../../src/types";

export function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM reports").get() as { count: number };
  if (count > 0) return;

  const insertReport = db.prepare(`
    INSERT INTO reports (
      id, title, description, category, status, urgency,
      reporter_name, reporter_role, reporter_email, reporter_whatsapp,
      is_public, moderation_status, attachment_name, attachment_path, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @category, @status, @urgency,
      @reporterName, @reporterRole, @reporterEmail, @reporterWhatsapp,
      @isPublic, 'APPROVED', @attachmentName, @attachmentPath, @createdAt, @updatedAt
    )
  `);

  const insertTimeline = db.prepare(`
    INSERT INTO report_timeline (report_id, status, note, timestamp)
    VALUES (@reportId, @status, @note, @timestamp)
  `);

  const insertComment = db.prepare(`
    INSERT INTO report_comments (id, report_id, sender_name, sender_role, content, created_at)
    VALUES (@id, @reportId, @senderName, @senderRole, @content, @createdAt)
  `);

  const insertAll = db.transaction((reports: Report[]) => {
    for (const report of reports) {
      insertReport.run({
        id: report.id,
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        urgency: report.urgency,
        reporterName: report.reporterName,
        reporterRole: report.reporterRole ?? null,
        reporterEmail: report.reporterEmail,
        reporterWhatsapp: report.reporterWhatsapp ?? null,
        isPublic: report.isPublic ? 1 : 0,
        attachmentName: report.attachmentName ?? null,
        attachmentPath: null,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      });

      for (const step of report.timeline) {
        insertTimeline.run({
          reportId: report.id,
          status: step.status,
          note: step.note,
          timestamp: step.timestamp,
        });
      }

      for (const comment of report.comments) {
        insertComment.run({
          id: comment.id,
          reportId: report.id,
          senderName: comment.senderName,
          senderRole: comment.senderRole,
          content: comment.content,
          createdAt: comment.createdAt,
        });
      }
    }
  });

  insertAll(INITIAL_REPORTS);
  console.log(`Seeded ${INITIAL_REPORTS.length} initial reports.`);
}
