function addCss() {
  var styles = `
  #management { 
    height: 100%;
    width: 100%;
    position: fixed;
    background-color: #e6e6e6;
    top: 0;
    left: 0;
    overflow: scroll;
  }

  button {
    margin: 4px;
  }

  button:focus {
    outline: none;
  }

  .hugeDiv {
    padding: 10px;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    margin: 5px;
    z-index: 1000;
    background-color: #e4e4e4;
  }

  .buttonContainer {
    display: block;
    margin: auto;
  }

  .buttonStyle {
    background-color: #a24a4a; /* Green */
    color: white;
    padding: 5px;
    text-align: center;
    margin-top: 5px;
    border-radius: 10px;
    width: 90px;
    cursor: pointer;
  }

  .titleContainer {    
    height: 100%;
    margin: auto;
    display: table;
  }

  .title {
    background: #e4e4e4;
    text-align: center;
    margin-bottom: 0px;
    border: solid 1px;
    padding: 0px 5px;
    display: table-cell;
    vertical-align: middle;
  }

  .textareaStyle {
    width: 250px;
    background-color: #ffffff;
    background-attachment: local;
    background-repeat: no-repeat;
    border-color: #ccc;
    padding: 12px;
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    line-height: 16px;
    resize:none;
    height: 120px;
    color: #000000;
  }
  `

  var styleSheet = document.createElement("style");
  styleSheet.rel = "stylesheet";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
