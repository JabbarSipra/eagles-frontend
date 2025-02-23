import { useState, useEffect } from "react";
import axios from "axios";
import Notify from "../Components/Lvl1/Notify";
import UserTable from "../Components/Lvl1/UserTable";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { GoPeople } from "react-icons/go";
import { RiLockLine } from "react-icons/ri";
import "./Pages.css";
import { activateLevel, getTxn, users } from "../Config/Contract-Methods";
import { useAccount } from "wagmi";
import { ApiUrl } from "../Config/config";
import { USDTapprove } from "../Config/Contract-Methods";

const Levelx1 = () => {
  const [apiData, setApiData] = useState(null);
  const [activeLevel, setActiveLevel] = useState("");
  const [data, setData] = useState("");
  const { isConnected, address } = useAccount();
  const [referredUsersCountByLevel, setReferredUsersCountByLevel] = useState(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await users(address);
        const level = result[2]?.toString();
        setActiveLevel(level);
        setData(result);

        if (result?.[1]) {
          const userId = result[1];
          const response = await axios.get(`${ApiUrl}/getalldata/${userId}`);
          setApiData(response.data);
          const referralUsers = response.data?.referredUsers || [];
          const connectedUserLevel = response.data?.data?.currentX1Level;

          const userCountByLevel = referralUsers.reduce((acc, user) => {
            const level = user?.currentX1Level;
            if (level && level <= connectedUserLevel) {
              acc[level] = (acc[level] || 0) + 1;
            }
            return acc;
          }, {});

          setReferredUsersCountByLevel(userCountByLevel);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [address]);

  const levels = [
    { level: 1, cost: 2.5 },
    { level: 2, cost: 5 },
    { level: 3, cost: 10 },
    { level: 4, cost: 20 },
    { level: 5, cost: 40 },
    { level: 6, cost: 80 },
    { level: 7, cost: 160 },
    { level: 8, cost: 320 },
    { level: 9, cost: 640 },
    { level: 10, cost: 1250 },
    { level: 11, cost: 2500 },
    { level: 12, cost: 5000 },
  ];

  const updatedLevels = levels.map((level) => {
    const filteredUsersCount = referredUsersCountByLevel[level.level] || 0;
    const recycleCount = Math.floor(filteredUsersCount / 4);

    return {
      ...level,
      maxUsers: filteredUsersCount,
      recycleCount,
    };
  });

  const handleActivateNextLevel = async (level, cost) => {
    try {
      console.log("level coming", level, cost);
      const val = (cost * 1e18).toString();
      const usdtApp = await USDTapprove(val);
      await getTxn(usdtApp);
      const approvetx = await activateLevel("1", level);
      await getTxn(approvetx);
      setActiveLevel((prevLevel) => Math.min(Number(prevLevel) + 1, 12));
    } catch (err) {
      console.error("Error activating level:", err);
    }
  };

  return (
    <>
      <div className="text-white p-2 m-4 hello">
        <p>
          ID {data?.[1]?.toString()} / Theeagles.io x1 ({activeLevel}/12)
        </p>
      </div>
      <div className="x1program">
        {updatedLevels.map((level) => {
          const isActive = level.level <= activeLevel;
          const isNextLevel = level.level === Number(activeLevel) + 1;
          const currentUsers = level.maxUsers % 4;
          const filteredUsersCount =
            referredUsersCountByLevel[level.level] || 0;
          return (
            <div className="levels" key={level.level}>
              <div className="level-value">
                <p>Level {level.level}</p>
                <div className="logo-usdt">
                  <img
                    src="/assets/LoginImages/tether.png"
                    alt="Tether Logo"
                    className="h-[12px] w-auto"
                  />
                  <p>{level.cost} USDT</p>
                </div>
              </div>

              {isActive ? (
                <div className="circles-x1">
                  <div className="all-circle">
                    {[1, 2, 3, 4].map((circleIndex) => {
                      const isFilled = currentUsers >= circleIndex;
                      const isRecycled =
                        filteredUsersCount % 4 === 0 && filteredUsersCount > 0;

                      return (
                        <div
                          key={circleIndex}
                          className="circle bg-transparent p-0.5 flex-shrink-0"
                        >
                          <div
                            className={`w-full h-full rounded-full ${
                              isRecycled
                                ? "bg-white"
                                : isFilled
                                ? "bg-black"
                                : "bg-transparent"
                            }`}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="locked-level">
                  {isNextLevel ? (
                    <button
                      className="active-btn"
                      onClick={() =>
                        handleActivateNextLevel(level.level, level.cost)
                      }
                    >
                      Activate
                    </button>
                  ) : (
                    <RiLockLine size={24} />
                  )}
                </div>
              )}

              <div className="level-value">
                <div className="logo-usdt">
                  <GoPeople />
                  {filteredUsersCount}
                </div>
                <div className="logo-usdt">
                  <HiOutlineArrowPath />
                  {level.recycleCount}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Notify />
      <UserTable apiData={apiData} />
    </>
  );
};

export default Levelx1;
