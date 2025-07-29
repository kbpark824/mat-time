import colors from '../constants/colors';

/**
 * Activity helper functions for consistent activity type handling across the app
 * Extracted from Home and Search screens to eliminate code duplication
 */

export const getActivityTypeLabel = (activity) => {
  switch (activity.activityType) {
    case 'session':
      return 'Training Session';
    case 'seminar':
      return 'Seminar';
    case 'competition':
      return 'Competition';
    default:
      return 'Activity';
  }
};

export const getActivityTypeColor = (activity) => {
  switch (activity.activityType) {
    case 'session':
      return '#E3F2FD'; // Light blue
    case 'seminar':
      return '#E8F5E8'; // Light green
    case 'competition':
      return '#FFF3E0'; // Light orange
    default:
      return colors.lightGray;
  }
};

export const getActivitySubtitle = (activity) => {
  switch (activity.activityType) {
    case 'session':
      return `${activity.type} - ${activity.duration} min`;
    case 'seminar':
      return `${activity.type} - ${activity.professorName}`;
    case 'competition':
      return `${activity.type} - ${activity.organization}`;
    default:
      return '';
  }
};

export const getNotesExcerpt = (activity) => {
  let notes = '';
  switch (activity.activityType) {
    case 'session':
      notes = activity.techniqueNotes || '';
      break;
    case 'seminar':
      notes = activity.techniqueNotes || '';
      break;
    case 'competition':
      notes = activity.generalNotes || '';
      break;
  }
  
  if (!notes || notes.trim() === '') {
    return 'No notes added';
  }
  
  // Return first 80 characters with ellipsis if longer
  return notes.length > 80 ? notes.substring(0, 80) + '...' : notes;
};

/**
 * Helper to get route name for activity editing
 */
export const getActivityRoute = (activity) => {
  const routeMap = {
    session: 'logSession',
    seminar: 'logSeminar', 
    competition: 'logCompetition'
  };
  
  return routeMap[activity.activityType];
};

/**
 * Activity type constants for consistent use across the app
 */
export const ACTIVITY_TYPES = {
  SESSION: 'session',
  SEMINAR: 'seminar',
  COMPETITION: 'competition'
};