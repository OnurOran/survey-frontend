import { QuestionType } from '@/src/types';
import { QuestionTypeConfig } from './types';

/**
 * Central registry for question types
 * Question types register themselves here
 */
class QuestionTypeRegistry {
  private registry = new Map<QuestionType, QuestionTypeConfig>();

  /**
   * Register a question type
   */
  register(config: QuestionTypeConfig): void {
    this.registry.set(config.type, config);
  }

  /**
   * Get a specific question type config
   */
  get(type: QuestionType): QuestionTypeConfig | undefined {
    return this.registry.get(type);
  }

  /**
   * Get all registered question types
   */
  getAll(): QuestionTypeConfig[] {
    return Array.from(this.registry.values());
  }

  /**
   * Check if a question type is registered
   */
  has(type: QuestionType): boolean {
    return this.registry.has(type);
  }
}

// Singleton instance
export const questionTypeRegistry = new QuestionTypeRegistry();

/**
 * Helper: Get question type config
 */
export function getQuestionType(type: QuestionType): QuestionTypeConfig | undefined {
  return questionTypeRegistry.get(type);
}

/**
 * Helper: Get all question types
 */
export function getAllQuestionTypes(): QuestionTypeConfig[] {
  return questionTypeRegistry.getAll();
}

/**
 * Helper: Register a question type
 */
export function registerQuestionType(config: QuestionTypeConfig): void {
  questionTypeRegistry.register(config);
}
