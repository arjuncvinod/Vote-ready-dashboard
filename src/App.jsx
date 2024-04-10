import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection } from "firebase/firestore";
import "./App.css";
import Graph from "./components/Graph";

export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [searchKey, setSearchKey] = useState("");
  const [constituencyKey, setConstituencyKey] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
 const [TotalLevels,setTotalLevels]=useState(0) //used in filtering 


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(app, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let sortedData = userData.sort(
        (a, b) => countTrue(b.level) - countTrue(a.level)
      );

      // Adding index after sorting
      sortedData.forEach((item, index) => {
        item.index = index + 1;
      });

      setData(sortedData);
    });

    return () => unsubscribe();
  }, []);

  function countTrue(booleanArray) {
    // Function to count the true values in the level array
    if (!booleanArray) return 0; // Handle case where booleanArray is null or undefined
    let count = 0;
    for (let i = 0; i < booleanArray.length; i++) {
      if (booleanArray[i] === true) {
        count++;
      }
    }
    return count;
  }

  useEffect(() => {
    let numberOfLevels = 0;
    data.forEach((user) => {
      // loop to find the max no of levels
      if (user.level && user.level.length > numberOfLevels) {
        numberOfLevels = user.level.length;
        setTotalLevels(numberOfLevels)
      }
    });
    // Setting the stat count dynamically based on the number of levels
    const statCount = {};
    for (let i = 1; i <= numberOfLevels; i++) {
      statCount[`l${i}`] = 0;
    }

    data.forEach((user) => {
      const levelsCompleted = user.level || Array(numberOfLevels).fill(false); // Fill with false if user.level is null or undefined
      levelsCompleted.forEach((level, index) => {
        if (level) {
          statCount[`l${index + 1}`]++;
        }
      });
    });

    setStats(statCount);
  }, [data]);

  function convertToPercentage(obj) {
    // Convert data in stats object to percentage
    const newObj = {};
    const totalCount = data.length; // Total number of users
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        newObj[key] = ((obj[key] / totalCount) * 100).toFixed();
      }
    }
    return newObj;
  }

  return (
    <>
      <nav>
        <a href="">Vote Ready</a>
        {/* <div className="search-container">
          <input
            type="text"
            placeholder="search user"
            onChange={(e) => {
              setSearchKey(e.target.value.toLowerCase());
            }}
            value={searchKey}
          />
        </div> */}
      </nav>
      <main>
        <h3 className="reg-count">
          Registered Officers: <span> {data.length}</span>
        </h3>
        <div className="graph-container">
          <Graph
            numLevels={data.length > 0 ? data[0].level.length : 0}
            statData={convertToPercentage(stats)}
          />
        </div>
        <h1 className="heading">Presiding Officers</h1>

        <div className="table-container style-3">
          <table>
            <tbody>
              <tr>
                <td colSpan={7} className="filters">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="search user"
                      onChange={(e) => {
                        setSearchKey(e.target.value.toLowerCase());
                      }}
                      value={searchKey}
                    />
                    Constituency
                    <select
                      name=""
                      id=""
                      onChange={(e) => setConstituencyKey(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Idukki">Idukki</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Wayanad">Wayanad</option>
                    </select>
                    Levels Completed
                    <select
                      name=""
                      id=""
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="0">0%</option>
                      <option value="50"> &lt;50%</option>
                      <option value="100">100% </option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr className="table-header">
                <th>Rank</th>
                <th>Id</th>
                <th className="tname">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Constituency</th>
                <th>Levels Completed</th>
              </tr>
              {data
                .filter((user) =>
                  constituencyKey === "All"
                    ? true
                    : user.Constituency.includes(constituencyKey)
                )
                .filter(
                  (user) =>
                    (user.Name &&
                      user.Name.toLowerCase().includes(searchKey)) ||
                    user.email.includes(searchKey) ||
                    (user.ID && user.ID.includes(searchKey))
                )
                .filter((user) => {
                  const completedLevels = countTrue(user.level);
                  if (levelFilter === "0") {
                    return completedLevels === 0;
                  } else if (levelFilter === "50") {
                    return completedLevels / TotalLevels < 0.5;
                  } else if (levelFilter === "100") {
                    return completedLevels === TotalLevels;
                  } else {
                    return true;
                  }
                })
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.index}</td>
                    <td>{user.ID || "-"}</td>
                    <td>{user.Name || "-"}</td>
                    <td>{user.email}</td>
                    <td>{user.Phone || "-"}</td>
                    <td>{user.Constituency || "-"}</td>
                    <td>{countTrue(user.level)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
