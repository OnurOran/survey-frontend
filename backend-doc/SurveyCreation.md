## Survey Creation & Question Types

### Supported Question Types
- `SingleSelect`: One option must/may be selected. Options are required.
- `MultiSelect`: Multiple options may be selected. Options are required.
- `OpenText`: Free text input. Options are ignored.
- `FileUpload`: Respondent uploads a single file. No options allowed. Max size 5 MB. Allowed MIME types default to `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `application/pdf`, or you can restrict per-question.

### Attachments (Survey Definition)
You can attach a single file to:
- The survey itself
- Each question
- Each option

Attachment JSON shape:
```json
{
  "fileName": "logo.png",
  "contentType": "image/png",
  "base64Content": "<base64-bytes>"
}
```
Rules: max 5 MB; allowed types: png, jpg/jpeg, webp, pdf.

### Creating a Survey (POST /api/surveys)
`ManageUsersOrDepartment` required. Body (`CreateSurveyCommand`):
```json
{
  "title": "Employee Satisfaction 2025",
  "description": "Quarterly pulse",
  "accessType": "Internal",
  "attachment": { "fileName": "cover.pdf", "contentType": "application/pdf", "base64Content": "..." },
  "questions": [
    {
      "text": "Overall satisfaction?",
      "type": "SingleSelect",
      "order": 1,
      "isRequired": true,
      "attachment": null,
      "options": [
        { "text": "Great", "order": 1, "value": 5, "attachment": null },
        { "text": "Good", "order": 2, "value": 4, "attachment": null }
      ]
    },
    {
      "text": "Upload a proof of concept (PDF only)",
      "type": "FileUpload",
      "order": 2,
      "isRequired": true,
      "attachment": null,
      "options": [],
      "allowedAttachmentContentTypes": ["application/pdf"]
    },
    {
      "text": "Any comments?",
      "type": "OpenText",
      "order": 3,
      "isRequired": false,
      "attachment": null,
      "options": null
    }
  ]
}
```
Notes:
- For `FileUpload` questions: `options` must be empty/omitted; use `allowedAttachmentContentTypes` to restrict (otherwise defaults to core allowlist).
- For non-file questions: `allowedAttachmentContentTypes` must be empty.

### Adding a Question (POST /api/surveys/{id}/questions)
Same shape as a single question object above (with optional attachment and per-option attachments). Validations:
- FileUpload: no options; attachment optional; allowed types optional (uses defaults).
- Non-file: options required for Single/Multi; no attachment for answers; allowed types not allowed.

### Submitting Answers (POST /api/participations/{id}/answers)
Body (`SubmitAnswerRequest`):
```json
{
  "questionId": "<guid>",
  "textValue": "string or null",
  "optionIds": ["<guid>", "..."],
  "attachment": {
    "fileName": "doc.pdf",
    "contentType": "application/pdf",
    "base64Content": "..."
  }
}
```
Rules:
- For `FileUpload` questions: only `attachment` is allowed; `textValue`/`optionIds` must be null/empty.
- For other question types: `attachment` must be null; use `textValue` (OpenText) or `optionIds` (Single/Multi).

### Downloading Attachments
- Survey/question/option attachments: `GET /api/attachments/{id}`
- Answer attachments: `GET /api/attachments/answers/{id}`
Access checks apply (department scope/admins; otherwise survey must be active and honor access type).
