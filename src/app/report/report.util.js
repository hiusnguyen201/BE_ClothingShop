import { DATE_COMPARES, SALE_TYPES } from '#src/app/report/report.constant';
import moment from 'moment-timezone';

moment().tz('Asia/Ho_Chi_Minh');

/**
 * Get date comparison range
 * @param {DATE_COMPARES} compareTo
 */
export function getDateComparisonRange(compareTo) {
  let currentStart, currentEnd;
  let previousStart, previousEnd;

  switch (compareTo) {
    case DATE_COMPARES.YESTERDAY:
      currentStart = moment().startOf('day');
      currentEnd = moment().endOf('day');
      previousStart = moment().subtract(1, 'day').startOf('day');
      previousEnd = moment().subtract(1, 'day').endOf('day');
      break;

    case DATE_COMPARES.WEEKLY:
      currentStart = moment().startOf('week');
      currentEnd = moment().endOf('week');
      previousStart = moment().subtract(1, 'week').startOf('week');
      previousEnd = moment().subtract(1, 'week').endOf('week');
      break;

    case DATE_COMPARES.MONTHLY:
      currentStart = moment().startOf('month');
      currentEnd = moment().endOf('month');
      previousStart = moment().subtract(1, 'month').startOf('month');
      previousEnd = moment().subtract(1, 'month').endOf('month');
      break;

    case DATE_COMPARES.YEARLY:
      currentStart = moment().startOf('year');
      currentEnd = moment().endOf('year');
      previousStart = moment().subtract(1, 'year').startOf('year');
      previousEnd = moment().subtract(1, 'year').endOf('year');
      break;

    default:
      throw new Error(`Unsupported compareTo: ${compareTo}`);
  }

  return {
    current: {
      start: currentStart.toDate(),
      end: currentEnd.toDate(),
    },
    previous: {
      start: previousStart.toDate(),
      end: previousEnd.toDate(),
    },
  };
}

/**
 * Get sale range info: start, end, and unit
 * @param {SALE_TYPES} type
 * @returns {{ start: moment.Moment, end: moment.Moment, unit: string }}
 */
export function getSaleRangeByType(type) {
  const end = moment();
  let start = end.clone();
  let unit = 'hour';

  switch (type) {
    case SALE_TYPES.LAST_24_HOURS:
      start = end.clone().subtract(24, 'hours');
      unit = 'hour';
      break;
    case SALE_TYPES.LAST_WEEK:
      start = end.clone().subtract(7, 'days');
      unit = 'day';
      break;
    case SALE_TYPES.LAST_MONTH:
      start = end.clone().subtract(1, 'month');
      unit = 'week';
      break;
    case SALE_TYPES.LAST_6_MONTH:
      start = end.clone().subtract(6, 'months');
      unit = 'month';
      break;
    case SALE_TYPES.YEAR:
      start = end.clone().subtract(1, 'year');
      unit = 'month';
      break;
    default:
      start = end.clone().subtract(24, 'hours');
      unit = 'hour';
      break;
  }

  return { start: start.toDate(), end: end.toDate(), unit };
}
