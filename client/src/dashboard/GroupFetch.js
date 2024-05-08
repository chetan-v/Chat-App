import React from "react";
import { useState, useEffect } from "react";

const GroupFetch = ({ email, handleGroupChat }) => {
  const [groupList, setGroupList] = useState([]);

  return (
    <table>
      <thead>
        <tr>
          <th>Groups</th>
        </tr>
      </thead>
      <tbody>
        {groupList
          .filter((item) => item.email !== email)
          .map((item, index) => (
            <tr key={index}>
              <td onClick={() => handleGroupChat(item.group_id)}>
                {item.g_name}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default GroupFetch;
