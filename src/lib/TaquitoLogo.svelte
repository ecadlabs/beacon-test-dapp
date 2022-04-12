<style lang="scss">
  img {
    position: absolute;
    top: 40%;
    left: 30%;
    transform: translate(-30%, -40%);
    z-index: 0;
    width: 250px;
    animation: circle 18s linear infinite;
  }

  @keyframes circle {
    0% {
      transform: rotate(0deg) translate(-400px) rotate(0deg);
    }
    100% {
      transform: rotate(360deg) translate(-400px) rotate(-360deg);
    }
  }
</style>

<img src="taquito-logo.png" alt="taquito-logo" />
