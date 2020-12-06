var numeroChange = [undefined, undefined, undefined];


function otherWebChange(e) {
  console.log(e.target.value);
  if (e.target.value === "Sim") {
    jQuery(".textarea").prop("required", true);
    jQuery(".textarea").prop("disabled", false);
  } else {
    jQuery(".textarea").prop("required", false);
    jQuery(".textarea").prop("disabled", true);
    jQuery(".textarea").val("");
  }
}

function checkBoxChange(inputId, id, position = 0) {
  let stringId = jQuery(inputId).attr("id");
  if (!numeroChange.includes(stringId)) {
    if (numeroChange.filter((val) => val !== undefined).length < 3) {
      jQuery(inputId).prop("checked", true);
      let index = numeroChange.findIndex((val) => val === undefined);
      numeroChange.splice(position ? position : index, 1, stringId);
      jQuery(id).attr(
        "data-after",
        numeroChange.findIndex((val) => val === stringId) + 1
      );
    } else {
      jQuery(inputId).prop("checked", false);
    }
  } else {
    let index = numeroChange.findIndex((val) => val === stringId);
    numeroChange.splice(index, 1, undefined);
  }
}

function initializeValues(formName, id = "") {
  let buscarId = id ? id : window.localStorage.getItem("id");
  let parser = new DOMParser();
  let valorPrevio = window.localStorage.getItem("respostas-" + buscarId);
  let xmlDoc = parser.parseFromString(valorPrevio, "text/xml");
  let inputsFormName = jQuery(formName).find(":input");

  for (let i = 0; i < inputsFormName.length; i++) {
    const input = jQuery(inputsFormName[i]);
    let resposta = jQuery(xmlDoc).find("#" + input.attr("name"));
    let text = jQuery(resposta).text();
    console.log(text);
    switch (input.attr("type")) {
      case "radio":
        if (input.attr("value") === text) {
          input.attr("checked", true);
        } else {
          input.attr("checked", false);
        }

        break;

      case "text":
      case "textarea":
        input.val(text);
        break;

      case "checkbox":
        let arrayRespostas = text.split(", ");
        let index = arrayRespostas.findIndex(
          (val) => val === input.attr("value")
        );
        if (index >= 0) {
          checkBoxChange(
            jQuery("#" + input.attr("id")),
            jQuery("#" + input.attr("id") + "Span"),
            index
          );
        }
        break;
      default:
        break;
    }
    if (input.attr("name") === "q5" && input.attr("value") === "Sim") {
      jQuery(".textarea").prop("required", true);
      jQuery(".textarea").prop("disabled", false);
    }
    else{
      jQuery(".textarea").prop("required", false);
      jQuery(".textarea").prop("disabled", true);
    }
  }
}

function goBack(formName, nameHtml) {
  validateForm(formName);
  document.location = nameHtml;
}

function start() {
  let id = new Date().getTime();
  window.localStorage.setItem("id", id);
  document.location = "Caracterization.html";
}

function validateForm(formName) {
  let buscarId = window.localStorage.getItem("id");
  let valorPrevio =
    window.localStorage.getItem("respostas-" + buscarId) ||
    "<Questionario></Questionario>";
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(valorPrevio, "text/xml");

  let valores = jQuery(formName).serializeArray();

  let valoresAgrupados = {};
  for (let i = 0; i < valores.length; i++) {
    valoresAgrupados[valores[i].name] = [
      ...(valoresAgrupados[valores[i].name] || []),
      valores[i],
    ];
  }

  Object.keys(valoresAgrupados).forEach((id) => {
    let question = xmlDoc.createElement("Question");

    let values = [];
    for (let i = 0; i < Object.keys(valoresAgrupados[id]).length; i++) {
      values.push(valoresAgrupados[id][i].value);
    }
    if (id === "q4") {
      values = [];
      numeroChange.forEach((input) => {
        values.push(jQuery("#" + input).attr("value"));
      });
    }
    let text = xmlDoc.createTextNode(values.join(", "));

    question.appendChild(text);
    jQuery(question).attr("id", id);
    let varia = jQuery(xmlDoc).find("#" + id);
    if (varia[0]) {
      console.log(varia.contents());
      varia.contents().remove();
      varia[0].appendChild(text);
    } else {
      xmlDoc.getElementsByTagName("Questionario")[0].appendChild(question);
    }
  });

  window.localStorage.setItem(
    "respostas-" + buscarId,
    new XMLSerializer().serializeToString(xmlDoc)
  );
}

function buscarRespostas(form) {
  let ids = Object.keys(window.localStorage)
    .filter((val) => val.includes("respostas-"))
    .map((val) => val.split("-")[1]);
  let select = document.getElementById("selectId");
  for (let i = 0; i < ids.length; i++) {
    let option = document.createElement("option");
    jQuery(option).val(ids[i]);
    jQuery(option).text(ids[i]);
    select.add(option);
  }
  console.log(ids);
  insertHtml(jQuery(select).val());
  initializeValues(form);
}

function selectChange(e, form) {
  insertHtml(e.target.value);
  initializeValues(form, e.target.value);
}

function insertHtml(id) {
  // let buscarId = window.localStorage.getItem('id');
  let parser = new DOMParser();
  let respostas = localStorage.getItem("respostas-" + id);
  let xmlDoc = parser.parseFromString(respostas, "text/xml");
  let arrayRespostas = jQuery(
    xmlDoc.getElementsByTagName("Questionario")[0]
  ).children();
  for (let i = 0; i < arrayRespostas.length; i++) {
    let answer = jQuery(arrayRespostas[i]).text();
    let id = jQuery(arrayRespostas[i]).attr("id");
    jQuery("#" + id + " .resposta").html(answer);
  }
}

function drawCanvasCircular(
  ctx,
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  color
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
}

function canvasCircular(name, titulo) {
  let padding = 20;
  let canvasCircular = document.getElementById("graficoCircular");
  let myLegend = document.getElementById("myLegend");
  canvasCircular.width = 300;
  canvasCircular.height = 300;

  let ctx = canvasCircular.getContext("2d");

  let ages = buscarTodas(name);
  let colors = ["#fde23e", "#f16e23", "#57d9ff", "#937e88", "yellow"];
  let total_value = 0;
  let color_index = 0;
  for (let categ in ages) {
    let val = ages[categ];
    total_value += val;
  }

  let start_angle = 0;
  for (categ in ages) {
    val = ages[categ];
    let slice_angle = (2 * Math.PI * val) / total_value;
    let pieRadius = Math.min(
      (canvasCircular.width - padding*2)  / 2,
      (canvasCircular.height - padding*2) / 2
    );

    // debugger;
    drawCanvasCircular(
      ctx,
      canvasCircular.width / 2,
      canvasCircular.height / 2,
      pieRadius,
      start_angle,
      start_angle + slice_angle,
      colors[color_index % colors.length]
    );

    start_angle += slice_angle;
    color_index++;
  }

  for (categ in ages) {
    val = ages[categ];
    let slice_angle = (2 * Math.PI * val) / total_value;
    let pieRadius = Math.min(
      canvasCircular.width / 2,
      canvasCircular.height / 2
    );
    let labelX =
      canvasCircular.width / 2 +
      (pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
    let labelY =
      canvasCircular.height / 2 +
      (pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);
    let labelText = Math.round((100 * val) / total_value);
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.fillText(labelText + "%", labelX, labelY);
    start_angle += slice_angle;
  }

  ctx.save();
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.font = "bold 14px Arial";
  ctx.fillText(titulo, canvasCircular.width / 2, canvasCircular.height);
  ctx.restore();

  if (myLegend) {
    color_index = 0;
    let legendHTML = "";
    for (categ in ages) {
      legendHTML +=
        "<div><span style='display:inline-block;width:20px;background-color:" +
        colors[color_index++] +
        ";'>&nbsp;</span> " +
        categ +
        "</div>";
    }
    myLegend.innerHTML = legendHTML;
  }
}

function drawLine(ctx, startX, startY, endX, endY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(
  ctx,
  upperLeftCornerX,
  upperLeftCornerY,
  width,
  height,
  color
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
  ctx.restore();
}

function canvasBarras(name, titulo) {
  let padding = 20;
  let canvasBarras = document.getElementById("graficoBarras");
  canvasBarras.width = 300;
  canvasBarras.height = 300;

  var ctx = canvasBarras.getContext("2d");

  let ages = buscarTodas(name);

  let colors = ["#fde23e", "#f16e23", "#57d9ff", "#937e88", "yellow"];
  let gridColor = "#EEEEEE";
  let maxValue = 0;
  let total_value = 0;
  for (let categ in ages) {
    maxValue = Math.max(maxValue, ages[categ]);
    total_value += ages[categ];
  }

  let canvasActualHeight = canvasBarras.height - padding * 2;
  let canvasActualWidth = canvasBarras.width - padding * 2;

  //drawing the grid lines
  let gridValue = 0;
  while (gridValue <= maxValue) {
    let gridY = canvasActualHeight * (1 - gridValue / maxValue) + padding;
    drawLine(ctx, 0, gridY, canvasBarras.width, gridY, gridColor);

    //writing grid markers
    ctx.save();
    ctx.fillStyle = gridColor;
    ctx.textBaseline = "bottom";
    ctx.font = "bold 10px Arial";
    ctx.fillText(gridValue, 10, gridY - 2);
    ctx.restore();

    gridValue += 5;
  }

  //drawing the bars
  let barIndex = 0;
  let numberOfBars = Object.keys(ages).length;
  let barSize = canvasActualWidth / numberOfBars;

  for (categ in ages) {
    var val = ages[categ];
    var barHeight = Math.round((canvasActualHeight * val) / maxValue);
    drawBar(
      ctx,
      padding + barIndex * barSize,
      canvasBarras.height - barHeight - padding,
      barSize,
      barHeight,
      colors[barIndex % colors.length]
    );

    barIndex++;
  }
  barIndex = 0;
  for (categ in ages) {
    let numberOfBars = Object.keys(ages).length;
    let barSize = canvasActualWidth / numberOfBars;
    val = ages[categ];
    let labelX = padding + barIndex * barSize + barSize / 3;
    console.log(labelX);
    let labelY = canvasActualHeight + -20;
    let labelText = Math.round((100 * val) / total_value);
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.fillText(labelText + "%", labelX, labelY);
    barIndex++;
  }

  ctx.save();
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.font = "bold 14px Arial";
  ctx.fillText(titulo, canvasBarras.width / 2, canvasBarras.height);
  ctx.restore();

  //draw legend
  barIndex = 0;
  var legend = document.getElementById("legendBarras");
  var ul = document.createElement("ul");
  legend.append(ul);
  for (categ in ages) {
    var li = document.createElement("li");
    li.style.listStyle = "none";
    li.style.borderLeft = "20px solid " + colors[barIndex % colors.length];
    li.style.padding = "5px";
    li.textContent = categ;
    ul.append(li);
    barIndex++;
  }
}

function iniciarGraficos() {
  // buscarTodas('#q25');
  canvasCircular("#q1", "Idades");
  canvasBarras("#q17", "Utiliza o website com frequência");
}

function buscarTodas(name) {
  let ids = Object.keys(window.localStorage).filter((val) =>
    val.includes("respostas-")
  );
  let todasRespostas = {};
  ids.forEach((id) => {
    let respostas = window.localStorage.getItem(id);
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(respostas, "text/xml");
    let questions = jQuery(xmlDoc).find(name);

    for (let i = 0; i < questions.length; i++) {
      let text = jQuery(questions[i]).text();
      todasRespostas[text] = (todasRespostas[text] || 0) + 1;
    }
  });
  return todasRespostas;
}
