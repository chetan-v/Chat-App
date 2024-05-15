// import React from "react";
// import { useState, useEffect } from "react";

// const GroupFetch = ({ email, handleGroupChat }) => {
//   const [groupList, setGroupList] = useState([]);
//     useEffect(() => {
//         const getGroups = async () => {
//         try {
//             const response = await fetch("http://localhost:5000/getgroups", {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             });
//             response.json().then((data) => {
//             if (data.Status === "success") {
//                 setGroupList(data.groups);
//             }
//             });
//         } catch (error) {
//             console.error(error);
//             // Handle other errors here
//         }
//         };
//         getGroups();
//     }, []);

//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>Groups</th>
//         </tr>
//       </thead>
//       <tbody>
//         {groupList
//           .filter((item) => item.email !== email)
//           .map((item, index) => (
//             <tr key={index}>
//               <td onClick={() => handleGroupChat(item.group_id)}>
//                 {item.g_name}
//               </td>
//             </tr>
//           ))}
//       </tbody>
//     </table>
//   );
// };

// export default GroupFetch;
