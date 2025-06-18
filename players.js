// Add click event to each player card to go to player-info.html with player name as query param

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.player-card').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      const player = card.getAttribute('data-player');
      window.location.href = `player-info.html?name=${encodeURIComponent(player)}`;
    });
  });
});
