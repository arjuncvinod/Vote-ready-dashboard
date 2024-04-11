import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection } from "firebase/firestore";
import "./App.css";
import Graph from "./components/Graph";
import Constituency from "./assets/ConstituencyData";
import Button from "@mui/material/Button";
import * as XLSX from "xlsx";

export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [searchKey, setSearchKey] = useState("");
  const [constituencyKey, setConstituencyKey] = useState("All");
  const [levelFilter, setLevelFilter] = useState("");
  const [TotalLevels, setTotalLevels] = useState(0); //used in filtering

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

  // Function to count the true values in the level array
  function countTrue(booleanArray) {
    if (!booleanArray) return 0;
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
      if (user.level && user.level.length > numberOfLevels) {
        numberOfLevels = user.level.length;
        setTotalLevels(numberOfLevels);
      }
    });

    const statCount = {};
    for (let i = 1; i <= numberOfLevels; i++) {
      statCount[`l${i}`] = 0;
    }

    data.forEach((user) => {
      const levelsCompleted = user.level || Array(numberOfLevels).fill(false);
      levelsCompleted.forEach((level, index) => {
        if (level) {
          statCount[`l${index + 1}`]++;
        }
      });
    });

    setStats(statCount);
  }, [data]);

  function convertToPercentage(obj) {
    const newObj = {};
    const totalCount = data.length;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        newObj[key] = ((obj[key] / totalCount) * 100).toFixed();
      }
    }
    return newObj;
  }

  //function to generate excel file
  const exportToExcel = () => {
    const fileName = "PresidingOfficersData.xlsx";
    const worksheetData = data.map((user) => {
      const { id, ...userData } = user; // Exclude id
      const levelsCompleted = countTrue(user.level);
      return {
        Rank: user.index,
        Name: user.Name,
        Email: user.email,
        Phone: user.Phone,
        Constituency: user.Constituency,
        "Levels Completed": levelsCompleted,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAsExcelFile(excelBuffer, fileName);
  };
  //function for excel file download button
  const saveAsExcelFile = (buffer, fileName) => {
    const data = new Blob([buffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <nav>
        <a href="">Vote Ready</a>
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
                <td colSpan={6} className="filters">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search user"
                      onChange={(e) => {
                        setSearchKey(e.target.value.toLowerCase());
                      }}
                      value={searchKey}
                    />
                    <div>
                      Constituency
                      <select
                        name=""
                        id=""
                        onChange={(e) => setConstituencyKey(e.target.value)}
                      >
                        <option>All</option>
                        {Constituency.map((constituency) => (
                          <option
                            key={constituency.id}
                            value={constituency.name}
                          >
                            {constituency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      Levels Completed
                      <select
                        name=""
                        id=""
                        onChange={(e) => setLevelFilter(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="0">0%</option>
                        <option value="50"> 0%-50%</option>
                        <option value="50-100">50%-100% </option>
                        <option value="100">100% </option>
                      </select>
                    </div>
                    <Button variant="contained" onClick={exportToExcel} className="excel-btn" style={{ backgroundColor: '#04b904',fontSize:'12px',}}>
                    Download as Excel
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="table-header">
                <th>Rank</th>
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
                    : user.Constituency &&
                      user.Constituency.includes(constituencyKey)
                )
                .filter(
                  (user) =>
                    (user.Name &&
                      user.Name.toLowerCase().includes(searchKey)) ||
                    user.email.includes(searchKey)
                )
                .filter((user) => {
                  const completedLevels = countTrue(user.level);
                  if (levelFilter === "0") {
                    return completedLevels === 0;
                  } else if (levelFilter === "50") {
                    return completedLevels / TotalLevels < 0.5;
                  } else if (levelFilter === "50-100") {
                    return (
                      completedLevels > 0.5 * TotalLevels &&
                      completedLevels <= TotalLevels
                    );
                  } else if (levelFilter === "100") {
                    return completedLevels === TotalLevels;
                  } else {
                    return true;
                  }
                })
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.index}</td>
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
