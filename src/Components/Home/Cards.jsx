import axios from "axios";
import { useEffect, useState } from "react";
import { BsShare } from "react-icons/bs";
import { GoArrowUp } from "react-icons/go";
import { ApiUrl } from "../../Config/config";

const Cards = ({ PT, userData }) => {
  const [partner24hCount, setPartner24hCount] = useState(0);
  const [team24hCount, setTeam24hCount] = useState(0);
  const [total24hProfit, setTotal24hProfit] = useState(0);
  const [teamCount, setTeamCount] = useState(0); // Total Team Count

  const totalProfit = userData?.[4]?.toString() / 1e18;

  useEffect(() => {
    axios.get(`${ApiUrl}/getCompleteReferralChain/${PT.id}`).then((res) => {
      const referralChain = res.data.data.referralChain;
      const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

      // 1. Partner 24h Count: Direct referrals within the last 24 hours
      const partner24hCountss = referralChain.filter(
        (user) =>
          user.referrer === PT.Personal &&
          new Date(user.createdAt) >= last24Hours
      ).length;
      setPartner24hCount(partner24hCountss);

      // Recursive function to get total team count (All levels)
      const getTotalTeamCount = (chain) => {
        let count = chain.length; // Current level count
        for (let user of chain) {
          if (user.referrals && user.referrals.length > 0) {
            count += getTotalTeamCount(user.referrals);
          }
        }
        return count;
      };

      // Get full team count including all levels
      const fullTeamCount = getTotalTeamCount(referralChain);
      setTeamCount(fullTeamCount);

      // 2. Team 24h Count: Recursive team calculation in last 24h
      const getTeam24hCount = (chain) => {
        let count = 0;
        for (let user of chain) {
          if (new Date(user.createdAt) >= last24Hours) {
            count++;
          }
          if (user.referrals && user.referrals.length > 0) {
            count += getTeam24hCount(user.referrals);
          }
        }
        return count;
      };

      const team24hCountss = getTeam24hCount(referralChain);
      setTeam24hCount(team24hCountss);

      // 3. Total 24h Profit
      const total24hProfitss = referralChain
        .filter((user) => new Date(user.updatedAt) >= last24Hours)
        .reduce(
          (sum, user) =>
            sum + parseFloat(user.totalUSDTReceived.toString()) / 1e18,
          0
        );
      setTotal24hProfit(total24hProfitss);
    });
  }, [PT.id, PT.Personal]);

  return (
    <div className="space-y-4">
      <div className="bg-Background w-full rounded-lg shadow-xl bg-image shadow-[#00000079] px-2 py-3">
        <div className="flex justify-between items-center">
          <p className="text-textColor3 font-semibold text-base flex items-center gap-2">
            Profits
            <span className="bg-[#5c5c5c] rounded-full p-1">
              <BsShare className="text-textColor3" />
            </span>
          </p>
        </div>
        <div className="flex justify-between font-semibold text-textColor3 mt-2">
          <p>{totalProfit || 0} USDT</p>
          <p className="flex items-center gap-1 text-green-600">
            <GoArrowUp />
            {total24hProfit || 0}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <StatCard
          title="Partners"
          count={PT.Partner}
          count24={partner24hCount}
          bg="bg-person2"
        />
        <StatCard
          title="Team"
          count={teamCount} // Fixed total team count
          count24={team24hCount}
          bg="bg-person3"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, count, count24, bg }) => {
  return (
    <div
      className={`bg-Background px-2 shadow-xl shadow-[#00000079] py-3 w-1/2 rounded-lg ${bg}`}
    >
      <p className="text-textColor3 text-base flex items-center gap-2">
        {/* {title} */}
        <span className="bg-[#5c5c5c] rounded-full p-1">
          <BsShare className="text-textColor3" />
        </span>
      </p>
      <p className="text-3xl text-textColor3 font-semibold mt-1">
      {/* {count} */}
      </p>
      <div className="w-[85%] mx-auto mt-7 flex justify-between p-1 rounded-full bg-[#a67912] bg-opacity-20">
        <div className="flex items-center font-medium text-xl text-green-600">
          <GoArrowUp />
          {/* {count24} */}0
        </div>
        <div className="gradient-circle"></div>
      </div>
    </div>
  );
};

export default Cards;
