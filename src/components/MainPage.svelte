<head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
</head>

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
    margin-bottom: 1rem;
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
    gap: 1rem;
    margin-right: 3rem;
  }

  .nav-icons i {
    color: #ffffff;
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.3s ease-in-out;
  }

  .nav-icons i:hover {
    transform: scale(1.2);
    color: #6737e1;
    text-shadow: 0 0 10px #333333;
  }

  .box-container {
    display: flex;
    justify-content: center;
    align-items: flex-start; /* Align at the top */
    margin-top: 1rem; /* Margin from the top */
  }

  .box {
    width: 240px; /* Increased width */
    height: 300px; /* Increased height */
    margin: 2rem;
    transition: all 0.3s ease-in-out;
    background-color: #1e1f2a; /* Background color matching nav */
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Align at the top */
    align-items: center;
    padding: 1rem;
    text-align: center;
  }

  .box:hover {
    transform: scale(1.1); /* Reduced scale on hover */
    border: 2px solid #400080; /* Border color on hover */
  }

  .box h2 {
    font-size: 1.5rem;
    color: #ffffff;
    margin: 1rem 0 0; /* Margin from the top */
    transition: all 0.3s ease-in-out;
  }

  .box:hover h2 {
    font-size: 1.8rem; /* Increased font size on hover */
  }
</style>

<main>
  <nav>
    <h1>TopHack</h1>
    <div class="nav-icons">
      <i class="fas fa-cog"></i>
      <i class="fas fa-sign-out-alt"></i>
    </div>
  </nav>

  <div class="box-container">
    <div class="box">
      <h2>Challenges</h2>
    </div>
    <div class="box">
      <h2>CTF - Team</h2>
    </div>
    <div class="box">
      <h2>Self Score</h2>
    </div>
  </div>
</main>
