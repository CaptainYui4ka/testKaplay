import { scaleFactor } from './constants';
import { k } from "./kaplayCtx";
import { displayDialogue } from "./utils";

k.loadSprite("soldier", "./public/assets/sprite/Soldier.png", { // load sprite
  sliceX: 9,
  sliceY: 7,
  anims: {
    idle: { from: 0, to: 5, loop: true, speed: 8 },
    walk: { from: 9, to: 16, loop: true, speed: 10 },
    attack: { from: 18, to: 23, loop: false, speed: 30 },
    damage: { from: 45, to: 48, loop: true, speed: 8 },
    death: {from :54, to: 57, loop: true, speed: 8},
  }
});

k.loadSprite("map", "./public/assets/map/map.png");
k.setBackground(k.Color.fromHex("#311047"));

/*const player = k.add([ // add player
  k.sprite("soldier"),
  k.anchor("center"),
  k.pos(k.center()),
  k.scale(4),
]);*/

k.scene("main", async () => { // асинхронная функция для сцены
  try {
    const response = await fetch("./public/assets/map/map.json"); // загрузка данных карты
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mapData = await response.json(); // получение данных карты в формате JSON
    const layers = mapData.layers; // получение слоев из данных карты

    const map = k.add([
      k.sprite("map"),
      k.pos(0, 0),
      k.scale(scaleFactor),
    ]); // добавление карты

    const player = k.add([ // добавление игрока
      k.sprite("soldier", { anim: "idle" }),
      k.area({
        shape: new k.Rect(k.vec2(0), 17, 17)
      }),
      k.body(), // добавление физического тела
      k.anchor("center"),
      k.pos(k.center()),
      k.scale(scaleFactor),
      {
        speed: 250,
        direction: "down",
        isInDialogue: false,
      },
      "player",
    ]);

    for (const layer of layers) { // перебор слоев
      if (layer.name === "boundaries") { // если слой - границы
        for (const boundary of layer.objects) { // перебор объектов
          map.add([ // добавление границы
            k.area({ // добавление области
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height), // установка формы
            }),
            k.body({ isStatic: true }), // установка тела
            k.pos(boundary.x, boundary.y), // установка позиции
            boundary.name, // установка имени
          ]);

          if (boundary.name === "dialogue") {
            player.onCollide(boundary.name, () => {
              player.isInDialogue = true;
              displayDialogue("TODO", () => (player.isInDialogue = false));
            });
          }
        }
      }

      if (layer.name === "spawn") {
        for (const entity of layer.objects) {
          if (entity.name === "player") {
            player.pos = k.vec2(
              (map.pos.x + entity.x) * scaleFactor,
              (map.pos.y + entity.y) * scaleFactor
            );
            k.add(player);
            continue;
          }
        }
      }
    }

    k.onUpdate(() => {
      k.camPos(player.pos.x, player.pos.y + 100);
    });

    k.onKeyDown("left", () => {
      if (!player.isInDialogue) {
        player.move(-player.speed, 0);
        player.flipX = true;
        if( player.curAnim() !== "walk"){
          player.play("walk");
        }
      }
    });

    k.onKeyDown("right", () => {
      if (!player.isInDialogue) {
        player.move(player.speed, 0);
        player.flipX = false;
        if( player.curAnim() !== "walk"){
          player.play("walk");
        }
      }
    });

    k.onKeyDown("up", () => {
      if (!player.isInDialogue) {
        player.move(0, -player.speed);
        if( player.curAnim() !== "walk"){
          player.play("walk");
        }
      }
    });

    k.onKeyDown("down", () => {
      if (!player.isInDialogue) {
        player.move(0, player.speed);
        if( player.curAnim() !== "walk"){
          player.play("walk");
        }
      }
    });

    k.onMouseDown(("left"), () => {
      player.play("attack");
    });

    k.onKeyRelease(["left", "right", "up", "down"], () => {
      player.play("idle");
    });

    k.onMouseRelease(["left"], () =>{
      player.play("idle");
    })

  } catch (error) {
    console.error("Ошибка загрузки карты:", error);
  }
});
k.go("main"); // go to main scene