/**
 * Utility to populate Assessment.questions array from questionIds
 * Joins Assessment with Questions collection
 */

import { Collection } from 'mongodb';
import { AssessmentDoc, SurveyQuestionDoc } from './schemas';

/**
 * Given an assessment with questionIds, populate its questions array
 * by fetching from the questions collection
 */
export async function populateAssessmentQuestions(
  assessment: AssessmentDoc,
  questionsCollection: Collection<SurveyQuestionDoc>
): Promise<AssessmentDoc> {
  if (!assessment.questionIds || assessment.questionIds.length === 0) {
    return { ...assessment, questions: [] };
  }

  try {
    const questions = await questionsCollection
      .find({ id: { $in: assessment.questionIds } })
      .toArray();

    // Sort questions by the order in questionIds array
    const orderedQuestions = assessment.questionIds
      .map((qId) => questions.find((q) => q.id === qId))
      .filter((q) => q !== undefined) as SurveyQuestionDoc[];

    return {
      ...assessment,
      questions: orderedQuestions
    };
  } catch (err) {
    console.error(`Error populating questions for assessment ${assessment.id}:`, err);
    return { ...assessment, questions: [] };
  }
}

/**
 * Populate all assessments' questions
 */
export async function populateAllAssessmentsQuestions(
  assessments: AssessmentDoc[],
  questionsCollection: Collection<SurveyQuestionDoc>
): Promise<AssessmentDoc[]> {
  try {
    return await Promise.all(
      assessments.map((a) => populateAssessmentQuestions(a, questionsCollection))
    );
  } catch (err) {
    console.error('Error populating all assessments:', err);
    return assessments;
  }
}

/**
 * When returning assessment from API, ensure questions are populated
 * This is a convenience method to avoid N+1 queries
 */
export async function getAssessmentWithQuestions(
  assessmentId: string,
  assessmentsCollection: Collection<AssessmentDoc>,
  questionsCollection: Collection<SurveyQuestionDoc>
): Promise<AssessmentDoc | null> {
  const assessment = await assessmentsCollection.findOne({ id: assessmentId });
  if (!assessment) return null;

  return populateAssessmentQuestions(assessment, questionsCollection);
}
