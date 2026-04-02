Poplist custom copy upload

Place your Excel file at this exact path:
public/uploads/poplist-copy.xlsx

Required sheet names and columns:

1) Sheet name: homePrompts
Columns:
- lang   (en or ja)
- title
- sub

Example rows:
en | What needs doing? | Say it messy. We will tidy it into tasks.
ja | 今日は何をする？ | 思いつくままで大丈夫。

2) Sheet name: allTasksDone
Columns:
- lang   (en or ja)
- title
- sub

Example rows:
en | Mission Completed | Every task is done.
ja | やることはすべて完了です | すべてのタスクが完了しました

Notes:
- If this file does not exist, Poplist uses built-in defaults.
- Language values must be exactly "en" or "ja".
- After replacing the file, do a hard refresh in the browser.
