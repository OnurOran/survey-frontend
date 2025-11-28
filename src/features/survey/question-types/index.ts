/**
 * Question Types Module
 * Central export and registration for all question types
 */

// Export registry and types
export * from './registry';
export * from './types';

// Import all question type configs
import { singleSelectConfig } from './SingleSelect';
import { multiSelectConfig } from './MultiSelect';
import { openTextConfig } from './OpenText';
import { fileUploadConfig } from './FileUpload';
import { registerQuestionType } from './registry';

// Register all question types
registerQuestionType(singleSelectConfig);
registerQuestionType(multiSelectConfig);
registerQuestionType(openTextConfig);
registerQuestionType(fileUploadConfig);

// Export individual configs for direct access if needed
export { singleSelectConfig, multiSelectConfig, openTextConfig, fileUploadConfig };
