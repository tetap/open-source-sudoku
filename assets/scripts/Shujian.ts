import { _decorator, Component, Node, Canvas, Camera, UITransform, Graphics, Label, Color, Vec3, view, ResolutionPolicy, Layers, EventTouch, sys, game, Game } from 'cc';
import { GameView, Painter } from './GameView';
const { ccclass } = _decorator;
const KEY='shujian.save.v1';
/** Attach to any node in an empty scene; the supplied Main.scene already includes it. */
@ccclass('Shujian')
export class Shujian extends Component {
  private ui!: Node; private ink!: Graphics; private labels: Label[]=[]; private used=0; private app!: GameView; private dirty=true;
  onLoad() {
    view.setDesignResolutionSize(390,844,ResolutionPolicy.SHOW_ALL);
    const cameraNode=new Node('Camera'); this.node.addChild(cameraNode);cameraNode.setPosition(0,0,1000);
    const camera=cameraNode.addComponent(Camera);camera.projection=Camera.ProjectionType.ORTHO;camera.orthoHeight=422;camera.near=0;camera.far=2000;camera.visibility=Layers.Enum.UI_2D;camera.clearColor=new Color(17,28,54,255);
    this.ui=new Node('Canvas');this.ui.layer=Layers.Enum.UI_2D;this.node.addChild(this.ui);this.ui.addComponent(UITransform).setContentSize(390,844);
    const canvas=this.ui.addComponent(Canvas);canvas.cameraComponent=camera;
    const drawing=new Node('Shapes');drawing.layer=Layers.Enum.UI_2D;this.ui.addChild(drawing);this.ink=drawing.addComponent(Graphics);
    this.app=new GameView(s=>{try{sys.localStorage.setItem(KEY,s);}catch{}},sys.localStorage.getItem(KEY)||undefined);
    this.ui.on(Node.EventType.TOUCH_END,(e:EventTouch)=>{const a=e.getUILocation();const p=this.ui.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(a.x,a.y,0));this.app.tap(p.x+195,422-p.y);this.dirty=true;},this);
    this.schedule(()=>{this.app.tick();this.dirty=true;},1);
    game.on(Game.EVENT_HIDE,this.hide,this);game.on(Game.EVENT_SHOW,this.show,this);
  }
  private hide(){this.app.game.paused=true;this.app.save();this.dirty=true;}
  private show(){this.dirty=true;}
  onDestroy(){game.off(Game.EVENT_HIDE,this.hide,this);game.off(Game.EVENT_SHOW,this.show,this);}
  update(){if(this.dirty){this.render();this.dirty=false;}}
  private render(){
    const g=this.ink;g.clear();this.used=0;
    const painter:Painter={
      ellipse:(x,y,w,h,c)=>{g.fillColor=new Color().fromHEX(c);g.ellipse(x-195,422-y,w/2,h/2);g.fill();},
      polygon:(points,c)=>{g.fillColor=new Color().fromHEX(c);points.forEach(([x,y],i)=>i?g.lineTo(x-195,422-y):g.moveTo(x-195,422-y));g.close();g.fill();},
      clearText:()=>{for(const label of this.labels)label.node.active=false;this.used=0;},
      rect:(x,y,w,h,c,r=0)=>{g.fillColor=new Color().fromHEX(c);if(r)g.roundRect(x-195,422-y-h,w,h,r);else g.rect(x-195,422-y-h,w,h);g.fill();},
      line:(x,y,x2,y2,c,w)=>{g.strokeColor=new Color().fromHEX(c);g.lineWidth=w;g.moveTo(x-195,422-y);g.lineTo(x2-195,422-y2);g.stroke();},
      text:(s,x,y,size,c,align='left',serif=false)=>{
        let label=this.labels[this.used++];if(!label){const n=new Node('Text');n.layer=Layers.Enum.UI_2D;this.ui.addChild(n);n.addComponent(UITransform);label=n.addComponent(Label);this.labels.push(label);}
        label.node.active=true;label.string=s;label.fontSize=size;label.lineHeight=size*1.3;label.fontFamily=serif?'Georgia':'Arial';label.useSystemFont=true;label.color=new Color().fromHEX(c);label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;label.overflow=Label.Overflow.NONE;label.updateRenderData(true);
        const width=label.node.getComponent(UITransform)!.width;label.node.setPosition(x-195+(align==='left'?width/2:align==='right'?-width/2:0),422-y);
      }
    };
    this.app.draw(painter);for(let i=this.used;i<this.labels.length;i++)this.labels[i].node.active=false;
  }
}
