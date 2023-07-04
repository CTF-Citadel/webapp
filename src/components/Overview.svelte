<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
</head>

<script>
  let showPopup = false;
  let ipAddress = "";

  function showPopupWindow() {
    showPopup = true;
  }

  function hidePopupWindow() {
    showPopup = false;
  }

  function handleInputChange(event) {
    ipAddress = event.target.value;
  }

  function handlePopupCancel() {
    hidePopupWindow();
    ipAddress = ""; // Reset the input value when canceling
  }

  function handlePopupSubmit() {
    if (ipAddressValid = validateIpAddress(ipAddress)) {
      showResults = true;
      startMan(ipAddress); // Call startMan function with the input value
      hidePopupWindow();
      ipAddress = ""; // Reset the input value after submission
    } else {
      showResults = true;
    }
  }
</script>

<style>
  :global(body) {
    background-color: #212332;
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #1e1f2a;
    padding: 1rem;
  }

  h1 {
    margin-left: 4rem;
    color: #ffffff;
    font-size: 2rem;
    font-weight: bold;
  }

  .nav-icons {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-right: 4rem;
  }

  .nav-icons i {
    color: #ffffff;
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.3s ease-in-out;
  }

  .nav-icons i:hover {
    transform: scale(1.5);
    color: #6737e1;
    text-shadow: 0 0 10px #333333;
  }

  .box-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.5rem; /* Adjust the margin-top value to reduce the space */
    height: calc(100vh - 6.5rem); /* Subtract the total height of the navigation bar from the viewport height */
  }

  .box-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem; /* Gap between boxes */
    max-width: 95%; /* Set maximum width of the box wrapper */
  }

  .box {
    flex: 1 0 30vw; /* Set a flexible width for the boxes based on viewport width */
    height: 70vh; /* Set a flexible height for the boxes based on viewport height */
    transition: all 0.3s ease-in-out;
    background-color: #1e1f2a;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Align items to the top of the box */
    align-items: center;
    padding: 2rem;
    text-align: center;
    position: relative;
    border-radius: 5px;
  }

  .box:hover {
    transform: scale(1.05);
    border: 2px solid #400080;
  }

  .box h2 {
    font-size: 3rem;
    color: #ffffff;
    margin: 1rem 0 0;
    transition: all 0.3s ease-in-out;
    font-weight: bold;
    position: relative; /* Add position relative to enable z-index */
    z-index: 1; /* Set a higher z-index value to appear above the background image */
  }

  .box-text {
    color: #ffffff;
    margin-top: 1rem;
    position: relative; /* Add position relative to enable z-index */
    z-index: 1; /* Set a higher z-index value to appear above the background image */
  }

  .box-content {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    margin-bottom: 2rem;
    position: relative; /* Add position relative to enable z-index */
    z-index: 1; /* Set a higher z-index value to appear above the background image */
  }

  .box button {
    background-color: #212332;
    color: #ffffff;
    border: 2px solid #ffffff;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    border-radius: 5px;
    position: relative; /* Add position relative to enable z-index */
    z-index: 1; /* Set a higher z-index value to appear above the background image */
  }

  .box-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: all 0.3s ease-in-out;
    opacity: 0.2; /* Set the initial opacity */
    filter: brightness(90%); /* Add initial darkness */
    z-index: 0; /* Set a lower z-index value to appear behind the content */
  }

  .box:hover .box-background {
    transform: scale(1.00);
    opacity: 0.4; /* Change the opacity on hover */
    filter: brightness(80%); /* Add more darkness on hover */
  }

  .box:hover h2 {
    color: #fff; /* Change the color on hover */
  }

  .box button:hover {
    background-color: #212332;
    transform: scale(1.2);
  }

  .popup-container {
    position: fixed;
    top: 0;
    left: -1.5vw; /* Enlarge the left side by the width of the viewport */
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    overflow: hidden;
    transition: left 0.3s ease-in-out; /* Add transition for smooth animation */
  }

  .popup-content {
    /* Styles for the popup content */
    background-color: #212332;
    padding: 2rem;
    border-radius: 0.5rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a shadow effect */
  }

  .popup-input {
    /* Styles for the input field */
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #212332;
    background-color: #111111;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .popup-buttons {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .submit-button,
  .cancel-button {
    padding: 0.5rem 1rem;
    background-color: #111111;
    border: none;
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
    flex: 1; /* Distribute available space equally */
    margin: 0 0.5rem; /* Add margin between the buttons */
  }
</style>





<main>
  <nav>
    <h1>Top Hack</h1>
    <div class="nav-icons">
      <button on:click|stopPropagation={showPopupWindow}>
        <i class="fas fa-cog"></i>
      </button>
      <button on:click|stopPropagation={showPopupWindow}>
        <i class="fas fa-exclamation"></i>
      </button>
      <button on:click|stopPropagation={showPopupWindow}>
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </nav>

  <div class="box-container">
    <div class="box-wrapper">

      <div class="box">
        <div class="box-background" style="background-image: url('../public/CTF Team/CTF Team.png')"></div>
        <h2>CTF Teams</h2>
        <p class="box-text">Overview your Team Points</p>
        <div class="box-content">
          <button>Proceed</button>
        </div>
      </div>
      <div class="box">
        <div class="box-background" style="background-image: url('../public/Challenges/challenges2.jpg')"></div>
        <h2>Challenges</h2>
        <p class="box-text">Here you Access the Challenges</p>
        <div class="box-content">
          <button>Proceed</button>
        </div>
      </div>
      <div class="box">
        <div class="box-background" style="background-image: url('../public/Scoreboard/scoreboard.jpg')"></div>
        <h2>Scoreboard</h2>
        <p class="box-text">View Self/Team Rank</p>
        <div class="box-content">
          <button>Proceed</button>
        </div>
      </div>
    </div>
  </div>

  <div class="flex justify-center items-center space-x-4">

    {#if showPopup}
    <div class="popup-container">
      <div class="popup-content">
        <input
          type="text"
          id="ipAddress"
          class="popup-input"
          placeholder="Are you Sure you want to Logout?"
          bind:value={ipAddress}
          on:input={handleInputChange}
        />

        <div class="popup-buttons">
          <button class="submit-button" on:click={handlePopupSubmit}>Submit</button>
          <button class="cancel-button" on:click={handlePopupCancel}>Cancel</button>
        </div>
      </div>
    </div>
    {/if}
  </div>
</main>