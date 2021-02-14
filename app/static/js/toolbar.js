
const handleToolbarClick = (targetButton) => {
    let isSelected = targetButton.style.backgroundColor == "rgb(206, 206, 206)";
    const toolbarButtons = document.querySelectorAll(".toolbarBtn");

    for (const button of toolbarButtons) {
        if (button != targetButton) {
            button.style.backgroundColor = "rgb(238, 238, 238)";
        }
    }

    if (!isSelected) {
        targetButton.style.backgroundColor = "rgb(206, 206, 206)";
    }
}

export { handleToolbarClick };