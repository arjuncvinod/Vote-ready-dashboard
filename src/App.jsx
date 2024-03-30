import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection, count } from "firebase/firestore";
import "./App.css";
export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ l1: 0, l2: 0, l3: 0, l10: 0 });
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(app, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(userData);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    let statCount1 = 0,
      statCount10 = 0;
    data.forEach((user) => {
      if (Number(user.level) >= 1) {
        statCount1++;
      }
      if (Number(user.level) >= 10) {
        statCount10++;
      }
    });
    setStats({ ...stats, l1: statCount1, l10: statCount10 });
  }, [data]);
  return (
    // <div>
    //   <h1>User Details</h1>
    //   <ul>
    //     {data.map((user) => (
    //       <li key={user.id}>
    //         <strong>Name:</strong> {user.username}
    //         <br />
    //         <strong>Email:</strong> {user.email}
    //         <br />
    //         <strong>level:</strong> {user.level}
    //         <br />
    //       </li>
    //     ))}
    //   </ul>
    // </div>

    <>
      <nav>
        <a href="">Vote Ready</a>
        <div className="search-container">
          <input
            type="text"
            placeholder="search user"
            onChange={(e) => {
              setSearchKey(e.target.value.toLowerCase());
            }}
            value={searchKey}
          />
        </div>
      </nav>
      <main>
        <div className="tiles-container">
          <div className="stat-box">
            <div>
              <h1>{data.length}</h1>
              <h2>Total Users</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l1 / data.length) * 100}%</h1>
              <h2>Lvl 1 completed</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l10 / data.length) * 100}%</h1>
              <h2>Lvl 10 completed</h2>
            </div>
          </div>
        </div>
        <h1 className="heading">Users</h1>

        <div className="table-container">
          <table>
            <tbody>
              <tr className="table-header">
                <th>Name</th>
                <th>Email</th>
                <th>Current Level</th>
              </tr>
              {data
                .filter(
                  (user) =>
                    user.username.toLowerCase().includes(searchKey) ||
                    user.email.includes(searchKey)
                )
                .sort((a, b) => a.username.localeCompare(b.username))
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.level}</td>
                  </tr>
                ))}
              {/* {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.level}</td>
                </tr>
              ))}
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.level}</td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
