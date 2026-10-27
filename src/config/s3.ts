import { S3Client } from "@aws-sdk/client-s3";
import { envVariables } from "./env";

export const s3 = new S3Client({
  region: envVariables.AWS.AWS_REGION,
  // credentials are resolved automatically from env/IAM role
});

export const BUCKET = envVariables.AWS.S3.S3_BUCKET_NAME;
