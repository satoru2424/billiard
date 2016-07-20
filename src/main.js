// phina.js をグローバル領域に展開
phina.globalize();

var NATIVE_SCREEN_WIDTH    = 480;
var NATIVE_SCREEN_HEIGHT   = 870;
var SCREEN_OFFSET_WIDTH = 0.1*NATIVE_SCREEN_WIDTH;
var SCREEN_OFFSET_HEIGHT  =0.1*NATIVE_SCREEN_HEIGHT;
var SCREEN_WIDTH  = NATIVE_SCREEN_WIDTH+SCREEN_OFFSET_WIDTH;
var SCREEN_HEIGHT = NATIVE_SCREEN_HEIGHT+SCREEN_OFFSET_HEIGHT;

var ASSETS = {
  'sound': {
    //'bgm': 'http://phi-jp.github.io/phina.js/assets/sounds/lo_002.mp3',
    'collision': 'https://raw.githubusercontent.com/satoru2424/billiard/master/sound/hito_ge_finger_hibiki02.mp3',
    'shot': 'https://raw.githubusercontent.com/satoru2424/billiard/master/sound/hito_ge_finger01.mp3',
    'pocketIn': 'https://raw.githubusercontent.com/satoru2424/billiard/master/sound/decision12.mp3',
    'gameOver': 'https://raw.githubusercontent.com/satoru2424/billiard/master/sound/ta_ta_dokan01.mp3',
    //'bgm': 'https://raw.githubusercontent.com/satoru2424/billiard/master/sound/cyrf_return_to_the_earth.mp3',
  },
};
























//******************************************************************************//
phina.define('Ball', {
  // CircleShapeを継承
  superClass: 'phina.display.CircleShape',
    // コンストラクタ
    init: function() {
      // 親クラス初期化
      this.superInit({
        radius: SCREEN_WIDTH*(0.03),
        fill: 'hsl({0}, 80%, 60%)'.format(Math.randint(0,360)),
        //alpha: 0.5,
        stroke: 'white',
        strokeWidth: 0,
      });
      this.id;
      //サブクラス初期化

      this.m = Math.PI*this.radius*this.radius;  // 面積 = 重さにする
      this.velocity= phina.geom.Vector2(0, 0);

      this.BOUNCINESS      = 0.8;
      this.FRICTION        = 0.95;
      this.GRAVITY         = phina.geom.Vector2(0, 0);

      //this.interaction;
      //this.explode();
    },

  update: function(app) {
    this.collide(this);
    this.move();
  },

  move: function(){
    this.velocity.mul(this.FRICTION);
    //if(this.velocity.x<0.01){this.velocity.x=0}
    //if(this.velocity.y<0.01){this.velocity.y=0}
    this.velocity.add(this.GRAVITY);
    this.position.add(this.velocity);
    var volume = this.velocity.length()/500;
    volume = ( volume > 0.01 ) ? 0.01 : volume;
    SoundManager.volume = volume;

    if (this.left < 0)  { this.left = 0;  this.velocity.x*=-1;  SoundManager.play('collision');}
    if (this.right > SCREEN_WIDTH) { this.right = SCREEN_WIDTH;   this.velocity.x*=-1; SoundManager.play('collision');}
    if (this.top < 0)   { this.top = 0; this.velocity.y*=-1;  SoundManager.play('collision');}
    if (this.bottom > SCREEN_HEIGHT){ this.bottom = SCREEN_HEIGHT;  this.velocity.y*=-1; SoundManager.play('collision');}

  },

  collide: function(self){
    BallGroup.children.each(function(objectBall){
     if (phina.geom.Collision.testCircleCircle(self, objectBall)) {

          var V   = phina.geom.Vector2;
          var m0  = self.m;
          var m1  = objectBall.m;
          var e   = 0.95;//BOUNCINESS;

          var abVec = phina.geom.Vector2.sub(objectBall.position, self.position); // 自分から相手へのベクトル
          var len = abVec.length();
          if (len == 0) return ;
          abVec.normalize();

          //ボールのめり込みによりボールがくっつくバグを修正
          var distance = (self.radius + objectBall.radius)-len;
          var sinkVec  = phina.geom.Vector2.mul(abVec, distance/2);
          self.position.sub(sinkVec);
          objectBall.position.add(sinkVec);

          var ma = ( (m1 / (m0+m1))*(1+e) ) * V.dot(V.sub(objectBall.velocity,  self.velocity), abVec);
          var mb = ( (m0 / (m0+m1))*(1+e) ) * V.dot(V.sub(self.velocity, objectBall.velocity), abVec);

          var Vt   = phina.geom.Vector2;
          //console.log(Math.abs(Vt.dot(Vt.sub(objectBall.velocity,  self.velocity),abVec))/500);
          var volume= Math.abs(Vt.dot(Vt.sub(objectBall.velocity,  self.velocity),abVec))/500;

          volume = ( volume > 0.01 ) ? 0.01 : volume;
          SoundManager.volume = volume;
          SoundManager.play('collision');

          self.velocity.add( V.mul(abVec, ma) );
          objectBall.velocity.add( V.mul(abVec, mb));


        }
    });
  },

  explode: function() {
      // 向きをセット
      this.velocity = phina.geom.Vector2.random(0, 360, 32);
  },

});

































//******************************************************************************//
phina.define('Pocket', {
  // CircleShapeを継承
  superClass: 'phina.display.CircleShape',
    // コンストラクタ
    init: function() {
      // 親クラス初期化
      this.superInit({
        radius: SCREEN_OFFSET_WIDTH/2,
        fill: 'black',
        //alpha: 0.5,
        stroke: 'white',
        strokeWidth: 0,
      });
      this.id;
      this.CircleGrop = DisplayElement().addChildTo(this);
      (10).times(function(i){
        CircleShape({radius: 0}).addChildTo(this.CircleGrop);
      },this);
    },

  update: function(app) {
    this.collide(this);
  },

  collide: function(self){
    BallGroup.children.each(function(objectBall){
     if (phina.geom.Collision.testCircleCircle(self, objectBall)) {
        SoundManager.volume = 0.02;
        if(objectBall.id==0){SoundManager.play('gameOver');}
        else{SoundManager.play('pocketIn');}

        //CircleShape({radius: objectBall.radius/4}).addChildTo(self.CircleGrop).setPosition(objectBall.x, objectBall.y);

        self.CircleGrop.children.each(function(circle){
            console.log(self.id);
            console.log(objectBall.x, objectBall.y);
            circle.fill = objectBall.fill;
            circle.x = objectBall.x;
            circle.y = objectBall.y;
            circle.scaleX=1,
            circle.scaleY=1,
            circle.radius = objectBall.radius;
            circle.tweener.clear();
          if(self.id==1){
            circle.x-=SCREEN_OFFSET_WIDTH/2; circle.y-=SCREEN_OFFSET_HEIGHT/2;
            circle.tweener.to({
                                x:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                scaleX:0,
                                scaleY:0,
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                        }

          if(self.id==2){
            circle.x-=SCREEN_OFFSET_WIDTH/2; circle.y-=SCREEN_HEIGHT/2;
            circle.tweener.to({
                                x:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:Math.randint(-NATIVE_SCREEN_HEIGHT/4, NATIVE_SCREEN_HEIGHT/4),
                                scaleX:0,
                                scaleY:0,
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                        }

          if(self.id==3){
            circle.x-=SCREEN_OFFSET_WIDTH/2; circle.y-=SCREEN_HEIGHT;
            circle.tweener.to({
                                x:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:-Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                scaleX:0,
                                scaleY:0,
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                      }

          if(self.id==4){
            circle.x-=SCREEN_HEIGHT/2; circle.y-=SCREEN_OFFSET_HEIGHT/2;
            circle.tweener.to({
                                x:-Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                scaleX:0,
                                scaleY:0,
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                        }

          if(self.id==5){
            circle.x-=SCREEN_HEIGHT/2; circle.y-=SCREEN_HEIGHT/2;
            circle.tweener.to({
                                x:-Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:-Math.randint(-NATIVE_SCREEN_HEIGHT/4, NATIVE_SCREEN_HEIGHT/4),
                                scaleX:0,
                                scaleY:0
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                          }

          if(self.id==6){
            circle.x-=SCREEN_HEIGHT/2; circle.y-=SCREEN_HEIGHT;
            circle.tweener.to({
                                x:-Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                y:Math.randint(0, NATIVE_SCREEN_HEIGHT/2),
                                scaleX:0,
                                scaleY:0,
                              },
                              1000,
                              "swing"
                            ).wait(1000);
                          }
        });
        objectBall.remove();
      }
    });
  },

});






































//******************************************************************************//
//線形標準器クラス
phina.define('LinerSight', {
  // Shapeクラスを継承
  superClass: 'Shape',
  // コンストラクタ
  init: function(options) {
    this.superInit(options);
    this.cursorX;
    this.cursorY;
    this.cueBallX;
    this.cueBallY;
  },
  // 自身のcanvasの描画内容
  render: function(canvas) {
    // スタイル指定
    canvas.clear();
    canvas.strokeStyle = this.stroke;
    canvas.lineWidth = this.strokeWidth;
    var reverseX = this.cueBallX+3*(this.cueBallX-this.cursorX);
    var reverseY = this.cueBallY+3*(this.cueBallY-this.cursorY);
    // ラインを引く
    canvas.drawLine(reverseX, reverseY, this.cueBallX, this.cueBallY);
  },
});





























//******************************************************************************//
// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function(options) {
    this.superInit(options);
    // 背景色を指定
    this.backgroundColor = '#444';
    //SoundManager.playMusic('bgm');
    // ラベルを生成
    this.LabelGroup = DisplayElement().addChildTo(this);
    Label({text: 'Ready:',fill: 'white'}).addChildTo(this.LabelGroup).setPosition(this.gridX.center(0),this.gridY.center(0));
    Label({text: '',fill: 'white'}).addChildTo(this.LabelGroup).setPosition(this.gridX.center(0),this.gridY.center(1));


    BallGroup = DisplayElement().addChildTo(this);
    //*********************************************************************//
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8), this.gridY.span(12)).id=0;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8), this.gridY.span(5)).id=1;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8.5), this.gridY.span(4.5)).id=2;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(7.5), this.gridY.span(4.5)).id=3;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(7), this.gridY.span(4)).id=4;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8), this.gridY.span(4)).id=5;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(9), this.gridY.span(4)).id=6;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(7.5), this.gridY.span(3.5)).id=7;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8.5), this.gridY.span(3.5)).id=8;
    Ball().addChildTo(BallGroup).setPosition(this.gridX.span(8), this.gridY.span(3)).id=9;

    BallGroup.children[0].fill = 'white';
    BallGroup.blendMode="lighter";
    BallGroup.alpha="0.7";
    //*********************************************************************//


    this.PocketGroup = DisplayElement().addChildTo(this);
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_OFFSET_WIDTH/2,SCREEN_OFFSET_WIDTH/2).id=1;
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_OFFSET_WIDTH/2,SCREEN_HEIGHT/2).id=2;
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_OFFSET_WIDTH/2,SCREEN_HEIGHT-(SCREEN_OFFSET_WIDTH/2)).id=3;
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_WIDTH-(SCREEN_OFFSET_WIDTH/2),SCREEN_OFFSET_WIDTH/2).id=4;
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_WIDTH-(SCREEN_OFFSET_WIDTH/2),SCREEN_HEIGHT/2).id=5;
    Pocket().addChildTo(this.PocketGroup).setPosition(SCREEN_WIDTH-(SCREEN_OFFSET_WIDTH/2),SCREEN_HEIGHT-(SCREEN_OFFSET_WIDTH/2)).id=6;
    this.PocketGroup.alpha="0.7";
    this.PocketGroup.blendMode='lighter';

    //Draggable().attachTo(BallGroup.children[0]);

    this.linerSight = LinerSight({
      width: SCREEN_WIDTH, // 画面の幅
      height: SCREEN_HEIGHT, // 画面の高さ
      stroke: 'red',
      strokeWidth: 2,
    }).addChildTo(this);
    this.linerSight.origin.set(0, 0);

    this.status = 'ready';
    this.score0 = BallGroup.children.length;
    this.doBreakShot = false;

  },


  update: function(app) {

    var p = app.pointer;
    this.linerSight._dirtyDraw = true;
    if(this.doBreakShot){this.LabelGroup.children[1].text=this.score0-BallGroup.children.length;}

    if(p.getPointing()){
      this.linerSight.cursorX = p.x;
      this.linerSight.cursorY = p.y;

      this.linerSight.cueBallX = BallGroup.children[0].x;
      this.linerSight.cueBallY = BallGroup.children[0].y;
    }


    if(p.getPointingEnd()){
      this.doBreakShot=true;
      this.status = 'move';
      this.LabelGroup.children[0].text='SCORE:';

      this.linerSight.cueBallX = this.linerSight.cursorX;
      this.linerSight.cueBallY = this.linerSight.cursorY;
    }


    if (this.status == 'move'){
      var velocity = phina.geom.Vector2(0.5*(BallGroup.children[0].x-p.x), 0.5*(BallGroup.children[0].y-p.y));

      var volume = velocity.length()/500;
      volume = ( volume > 0.01 ) ? 0.01 : volume;
      SoundManager.volume = volume;
      SoundManager.play('collision');

      BallGroup.children[0].velocity = velocity;
      this.status = 'ready';
    }

    if(BallGroup.children[0].id!=0){
      this.gameOver(app);
    }else if(BallGroup.children.length==1){
      this.gameClear(app);
    }

  },

  gameClear: function(app) {
    this.LabelGroup.children[0].text='PerfectClear:';
    app.stop();
  },

  gameOver: function(app) {
    this.LabelGroup.children[0].text='GameOver:';
    app.stop();
  },


});
































//******************************************************************************//
// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    startLabel: 'main', // メインシーンから開始する
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
  });
  // アプリケーション実行
  app.run();
});
