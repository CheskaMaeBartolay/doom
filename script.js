const games = {
  modded:[
    {
      name:"SAE MODDED",
      tags:["GG","Modded"],
      desc:"Easy Grind, Free admin",
      image:"assets/games/sae-modded.png",
      art:"linear-gradient(135deg,#235fc5,#6ee1ff 45%,#e9a32b)",
      title:"SAE<br>MODDED"
    },
    {
      name:"coming soon",
      tags:["Script","Modded"],
      desc:"Auto Farm, Auto Open, Fast Hatch and more!",
      image:"assets/games/pet-simulator.png",
      art:"linear-gradient(135deg,#a9e75d,#2e6fcb)",
      title:"PET<br>SIMULATOR"
    },
    {
      name:"coming soon",
      tags:["Script","Modded"],
      desc:"Auto Farm, Auto Click, Infinite Yen and more!",
      image:"assets/games/anime-fighters.png",
      art:"linear-gradient(135deg,#562a9d,#ec4d94,#182d79)",
      title:"ANIME<br>FIGHTERS"
    },
    {
      name:"coming soon",
      tags:["Executor","Modded"],
      desc:"Universal script for all games. Works on most experiences.",
      image:"assets/games/infinite-yield.png",
      art:"linear-gradient(135deg,#071b36,#142d4b,#0b1019)",
      title:"INFINITE<br><span style='color:#ff4257'>YIELD</span>"
    },
    {
      name:"coming soon",
      tags:["Script","Modded"],
      desc:"Aimbot, ESP, No Recoil and more!",
      image:"assets/games/arsenal.png",
      art:"linear-gradient(135deg,#334a61,#d7b28d,#7e382c)",
      title:"ARSENAL"
    }
  ],
  mygames:[
    {
      name:"coming soon",
      tags:["Survival","Adventure"],
      desc:"Survive, explore and complete missions in a dark world.",
      image:"assets/games/project-eclipse.png",
      art:"linear-gradient(135deg,#07152e,#233e6e,#060c19)",
      title:"PROJECT<br>ECLIPSE"
    },
    {
      name:"coming soon",
      tags:["Tycoon","Simulator"],
      desc:"Grow your garden, collect items and become the richest!",
      image:"assets/games/gardener-tycoon.png",
      art:"linear-gradient(135deg,#4d9c45,#f4b64a,#2e6b48)",
      title:"GARDENER<br>TYCOON"
    },
    {
      name:"coming soon",
      tags:["PVP","Action"],
      desc:"Fight with your favorite anime characters!",
      image:"assets/games/anime-battle-arena.png",
      art:"linear-gradient(135deg,#4e1c91,#f2499a,#111c58)",
      title:"ANIME<br>ARENA"
    },
    {
      name:"coming soon",
      tags:["Tycoon","Simulation"],
      desc:"Buy, customize and sell your dream cars.",
      image:"assets/games/car-dealership.png",
      art:"linear-gradient(135deg,#b6d8e8,#5b8ca8,#243e55)",
      title:"CAR<br>DEALERSHIP"
    },
    {
      name:"coming soon",
      tags:["Survival","Building"],
      desc:"Build, survive and explore the island.",
      image:"assets/games/island-survival.png",
      art:"linear-gradient(135deg,#52c4f4,#f2dc83,#36a66c)",
      title:"ISLAND<br>SURVIVAL"
    }
  ]
};
const esc = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(g,i){
  const image = g.image
    ? `<img class="game-image" src="${esc(g.image)}" alt="${esc(g.name)}" loading="lazy" onerror="this.style.display='none'">`
    : "";

  return `<article class="game-card" data-name="${esc(g.name.toLowerCase())}">
    <div class="thumb" style="--art:${g.art}">
      ${image}
      <div class="thumb-overlay"></div>
      <div class="thumb-title">${g.title}</div>
      <div class="thumb-sub">KAFKA HUB</div>
    </div>
    <div class="game-body">
      <h3>${esc(g.name)}</h3>
      ${g.desc?`<p class="desc">${esc(g.desc)}</p>`:""}
      <div class="tags">${g.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="meta"><span>◉ Featured</span><button class="play-btn" onclick="playGame('${esc(g.name)}')">Play Now →</button></div>
    </div>
  </article>`;
}
function render(){
  document.querySelector("#moddedGrid").innerHTML=games.modded.map((g,i)=>card(g,i)).join("");
  document.querySelector("#myGrid").innerHTML=games.mygames.map((g,i)=>card(g,i)).join("");
}
const gameLinks = {
  "SAE MODDED": "https://www.roblox.com/games/109556794504107/SAE-MOD-X99999-F2P-ADMIN",
  "Pet Simulator 99 Mod": "YOUR-PET-SIMULATOR-LINK",
  "Anime Fighters Simulator": "YOUR-ANIME-FIGHTERS-LINK",
  "Infinite Yield": "YOUR-INFINITE-YIELD-LINK",
  "Arsenal Mod": "YOUR-ARSENAL-LINK",
  "Project Eclipse": "YOUR-PROJECT-ECLIPSE-LINK",
  "Gardener Tycoon": "YOUR-GARDENER-LINK",
  "Anime Battle Arena": "YOUR-ANIME-ARENA-LINK",
  "Car Dealership": "YOUR-CAR-DEALERSHIP-LINK",
  "Island Survival": "YOUR-ISLAND-LINK"
};

function playGame(name) {
  const link = gameLinks[name];

  if (link) {
    window.open(link, "_blank");
  } else {
    alert("Game link not added yet. Stay tune for more updates.");
  }
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
  const target=document.querySelector('#'+b.dataset.view);
  if(target) target.scrollIntoView({behavior:'smooth'});
}));
render();


document.querySelector("#searchInput").addEventListener("input", function () {
  const searchText = this.value.toLowerCase().trim();
  let count = 0;

  document.querySelectorAll(".game-card").forEach(function (card) {
    const show = card.dataset.name.includes(searchText);
    card.style.display = show ? "" : "none";
    if (show) count++;
  });

  document.querySelector("#emptyState").hidden = count !== 0;
});

// Roblox presence checker
const ROBLOX_USER_ID = 977146001;
const onlineStatus = document.getElementById("onlineStatus");
const statusDot = document.getElementById("statusDot");
const currentGame = document.getElementById("currentGame");
const joinGameBtn = document.getElementById("joinGameBtn");
const lastUpdated = document.getElementById("lastUpdated");

async function loadRobloxPresence() {
  // Always hide the join button before checking
  joinGameBtn.style.display = "none";
  joinGameBtn.hidden = true;

  try {
    const response = await fetch(
      `/api/presence?userId=${ROBLOX_USER_ID}&t=${Date.now()}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      }
    );

    const data = await response.json();
    const presence = data.userPresences?.[0];

    console.log("Roblox presence:", presence);

    if (!presence) {
      onlineStatus.textContent = "Offline";
      currentGame.textContent = "Not currently playing Roblox.";
      statusDot.className = "status-dot offline";
      return;
    }

    const presenceType = Number(presence.userPresenceType);

    // Only show Join Game when actually inside a Roblox game
    if (presenceType === 2) {
      onlineStatus.textContent = "Currently Playing";
      currentGame.textContent =
        presence.lastLocation || "Playing a Roblox game";
      statusDot.className = "status-dot online";

      const placeId = presence.placeId || presence.rootPlaceId;

      if (placeId) {
        joinGameBtn.href =
          `https://www.roblox.com/games/start?placeId=${placeId}`;

        joinGameBtn.textContent = "Join Current Game →";
        joinGameBtn.style.display = "inline-flex";
        joinGameBtn.hidden = false;
      }

      return;
    }

    if (presenceType === 3) {
      onlineStatus.textContent = "In Roblox Studio";
      currentGame.textContent = "Currently developing in Roblox Studio.";
      statusDot.className = "status-dot studio";
      return;
    }

    if (presenceType === 1) {
      onlineStatus.textContent = "Online";
      currentGame.textContent = "Browsing Roblox.";
      statusDot.className = "status-dot online";
      return;
    }

    onlineStatus.textContent = "Offline";
    currentGame.textContent = "Not currently playing Roblox.";
    statusDot.className = "status-dot offline";

  } catch (error) {
    console.error("Roblox presence error:", error);

    onlineStatus.textContent = "Status unavailable";
    currentGame.textContent = "Could not load Roblox activity.";
    statusDot.className = "status-dot offline";
  }
}

// Check immediately, then every 2 seconds
loadRobloxPresence();
setInterval(loadRobloxPresence, 2000);