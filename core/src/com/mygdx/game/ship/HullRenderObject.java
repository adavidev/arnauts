package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderManager;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Alan on 4/18/2016.
 */
public class HullRenderObject {
    public HullRenderObject(GameNode node) {

        Hull h = new Hull(node);
        RenderManager.sort();
    }
    public class Hull extends RenderObject {

        private final Texture hullb, hullempty, hulll, hullr, hullt;
        private final TextureRegion trhullb, trhullempty, trhulll, trhullr, trhullt;

        public Hull(GameNode node) {
            super(node, "hullB.png");
            hullb = new Texture("hullB.png");
            hullempty = new Texture("hullEmpty.png");
            hulll = new Texture("hullL.png");
            hullr = new Texture("hullR.png");
            hullt = new Texture("hullT.png");

            trhullb = new TextureRegion(hullb);
            trhullempty = new TextureRegion(hullempty);
            trhulll = new TextureRegion(hulll);
            trhullr = new TextureRegion(hullr);
            trhullt = new TextureRegion(hullt);
        }

        @Override
        public void draw(SpriteBatch batch) {
            Ship s = (Ship)myNode.parent;
            Texture tr;
            if(s.get(((Tile)myNode).x + 1, (((Tile)myNode).y)).type == TileType.Corridor) {
                batch.draw(trhulll, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
            if(s.get(((Tile)myNode).x - 1, ((Tile)myNode).y).type == TileType.Corridor) {
                batch.draw(trhullr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
            if(s.get(((Tile)myNode).x, (((Tile)myNode).y + 1)).type == TileType.Corridor) {
                batch.draw(trhullb, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
            if(s.get(((Tile)myNode).x, (((Tile)myNode).y - 1)).type == TileType.Corridor) {
                batch.draw(trhullt, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
//            if(s.shipTiles.get(((Tile)myNode).x + 1, (((Tile)myNode).y)).type == TileType.Corridor) {
//                batch.draw(trhulll, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
//            }
//                batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
        }
    }
//    class Background extends RenderObject {
//        TextureRegion tr;
//        float stateTime;
//
//        public Background(GameNode node) {
//            super(node, "hullR.png");
//            this.zIndex = 5;
//            tr = new TextureRegion(this, 0,0,25,50);
//        }
//
//        @Override
//        public void draw(SpriteBatch batch) {
//            stateTime += Gdx.graphics.getDeltaTime();
//    //            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
//        }
//    }
//
//    class MiddleGround extends RenderObject {
//        TextureRegion tr;
//        float stateTime;
//
//        public MiddleGround(GameNode node) {
//            super(node, "hullR.png");
//            this.zIndex = 6;
//            tr = new TextureRegion(this, 0,0,25,50);
//        }
//
//        @Override
//        public void draw(SpriteBatch batch) {
//            stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
//    //            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
//        }
//    }
}
