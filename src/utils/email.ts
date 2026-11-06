import ejs from "ejs";
import fs from "fs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVariables } from "../config/env.js";
import AppError from "../errors/app-error.js";
import { getError } from "../errors/get-error.js";

const transporter = nodemailer.createTransport({
  host: envVariables.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVariables.EMAIL_SENDER.SMTP_USER,
    pass: envVariables.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envVariables.EMAIL_SENDER.SMTP_PORT),
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
    cid?: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`,
    );

    const templateAttachments = [...(attachments ?? [])];

    if (templateName === "otp") {
      const logoPath = path.resolve(process.cwd(), "public/assets/logo.png");

      templateAttachments.unshift({
        filename: "logo.png",
        content: fs.readFileSync(logoPath),
        contentType: "image/png",
        cid: "company-logo",
      });
    }

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVariables.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: templateAttachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
        cid: attachment.cid,
      })),
    });

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: unknown) {
    console.log("Email Sending Error", getError(error));
    throw new AppError(status.INTERNAL_SERVER_ERROR, getError(error));
  }
};
