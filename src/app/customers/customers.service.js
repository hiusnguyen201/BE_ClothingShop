import moment from 'moment-timezone';
import { UserModel } from '#src/app/users/models/user.model';
import { USER_TYPE } from '#src/app/users/users.constant';

export async function getTodayCustomerReportService() {
  const startOfToday = moment().startOf('day').toDate();
  const endOfToday = moment().endOf('day').toDate();

  const startOfYesterday = moment().subtract(1, 'day').startOf('day').toDate();
  const endOfYesterday = moment().subtract(1, 'day').endOf('day').toDate();

  const todayStats = await UserModel.aggregate([
    {
      $match: {
        type: USER_TYPE.CUSTOMER,
        createdAt: {
          $gte: startOfToday,
          $lt: endOfToday,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalNew: { $sum: 1 },
      },
    },
  ]);

  const yesterdayStats = await UserModel.aggregate([
    {
      $match: {
        type: USER_TYPE.CUSTOMER,
        createdAt: {
          $gte: startOfYesterday,
          $lt: endOfYesterday,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalNew: { $sum: 1 },
      },
    },
  ]);

  const totalCustomerOverall = await UserModel.countDocuments({
    type: USER_TYPE.CUSTOMER,
  });

  const totalNewPercentage =
    todayStats[0]?.totalNew && yesterdayStats[0]?.totalNew
      ? ((todayStats[0].totalNew - yesterdayStats[0].totalNew) / yesterdayStats[0].totalNew) * 100
      : 0;

  return {
    totalCustomerOverall,
    todayTotalNewCustomers: todayStats[0]?.totalNew || 0,
    yesterdayTotalNewCustomers: yesterdayStats[0]?.totalNew || 0,
    percentage: totalNewPercentage.toFixed(1),
  };
}
