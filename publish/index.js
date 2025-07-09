const k65BackCount = {
  "Giáo dục thể chất (Tự Chọn)": 3,
  "Chuyên sâu (Tự Chọn)": 6,
  "Kiến thức ngành (Tự Chọn)": 5,
};

const k66LaterCount = {
  "Chuyên sâu (Tự Chọn)": 10,
};

document.addEventListener("DOMContentLoaded", async (e) => {
  const getMajorId = await fetch(
    "https://daihocchinhquy.neu.edu.vn/Home/StudyPrograms"
  );
  const majorIdText = await getMajorId.text();

  const mockHTML = document.createElement("div");
  mockHTML.innerHTML = majorIdText;

  const majorId = mockHTML
    .querySelector("#ddlStudyProgams")
    .querySelector("option").value;
  const studentCourse = parseInt(majorId.substring(1, 3));

  const studyResultRes = await fetch(
    "https://daihocchinhquy.neu.edu.vn/Home/ShowMark?StudyProgram=" +
      majorId +
      "&YearStudy=0&TermID=0&HeDiem=10&t=0.1"
  );
  const studyResult = await studyResultRes.text();

  const syllabusResult = await fetch(
    "https://daihocchinhquy.neu.edu.vn/Home/StudentStudyPrograms/" +
      majorId +
      "?t=0.1"
  );
  const data = await syllabusResult.text();

  document.querySelector("#placeholder").innerHTML = data;

  const element = document.querySelector(".table-responsive");
  const trSelector = element.querySelectorAll("tr");

  var currentGroup = "";
  var currentStage = "";

  const count = {
    "Chuẩn đầu ra 03 học phần tiếng Anh": [1, 2, 3],
  };
  const dataGroupBySubjectGroup = {};

  for (var i = 0; i < trSelector.length; i++) {
    const tds = trSelector[i].querySelectorAll("td");

    if (tds.length != 10) {
      if (tds.length == 1) {
        const tile = tds[0];
        if (tile.style.backgroundColor == "rgb(233, 150, 122)") {
          currentGroup = tile.innerHTML
            .replace("<b>", "")
            .replace("</b>", "")
            .replace(/\b\d+\.\s*/g, "");
        } else if (tile.style.backgroundColor == "rgb(176, 224, 230)") {
          currentStage = tile.innerHTML
            .replace("<b>", "")
            .replace("</b>", "")
            .replace(/\b\d+\.\s*/g, "");
        }
      }
      continue;
    }

    const id = tds[1].innerHTML;
    const name = tds[2].innerHTML;

    const key = currentGroup + " (" + currentStage + ")";
    if (Object.keys(count).includes(key)) {
      count[key] = [...count[key], name];
    } else {
      count[key] = [name];
    }

    if (studyResult.includes(id)) {
      if (["Tiếng Anh 1", "Tiếng Anh 2", "Tiếng Anh 3"].includes(name)) {
        if (
          Object.keys(dataGroupBySubjectGroup).includes(
            "Chuẩn đầu ra 03 học phần tiếng Anh"
          )
        ) {
          dataGroupBySubjectGroup["Chuẩn đầu ra 03 học phần tiếng Anh"] = [
            ...dataGroupBySubjectGroup["Chuẩn đầu ra 03 học phần tiếng Anh"],
            name,
          ];
        } else {
          dataGroupBySubjectGroup["Chuẩn đầu ra 03 học phần tiếng Anh"] = [
            name,
          ];
        }
      }

      if (Object.keys(dataGroupBySubjectGroup).includes(key)) {
        dataGroupBySubjectGroup[key] = [...dataGroupBySubjectGroup[key], name];
      } else {
        dataGroupBySubjectGroup[key] = [name];
      }

      trSelector[i].classList.add("done");
    }
  }

  var text = "";
  Object.entries(dataGroupBySubjectGroup).forEach(([key, value]) => {
    if (key.includes("Học phần chung")) return;

    const criteriaMap = studentCourse <= 65 ? k65BackCount : k66LaterCount;

    const currentLength = dataGroupBySubjectGroup[key].length;
    const countLength = count[key].length;
    console.log(count);

    var mustHave = 0;

    var passed = false;

    if (
      key.includes("Bắt Buộc") ||
      key.includes("tiếng Anh đầu vào") ||
      key.includes("đầu ra")
    ) {
      passed = currentLength >= countLength;
      mustHave = countLength;
    } else {
      if (criteriaMap[key]) {
        passed = currentLength >= criteriaMap[key];
        mustHave = criteriaMap[key];
      } else {
        passed = true;
      }
    }

    if (passed) {
      text += key + " " + currentLength + "/" + mustHave + " " + "✅";
    } else {
      text += key + " " + currentLength + "/" + mustHave + " " + "❌";
    }
    text += "<br/>";
  });

  document.querySelector("#result").innerHTML = "<p>" + text + "</p>";

  console.log(dataGroupBySubjectGroup);
});
