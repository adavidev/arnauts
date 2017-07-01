package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.*;

/**
 * Created by al on 4/7/2016.
 */
public class CorridorRenderObject {

    public CorridorRenderObject(GameNode node) {

        MiddleGround mg = new MiddleGround(node);
        Doodad doo = new Doodad(node);

        RenderManager.sort();
    }

    class MiddleGround extends RenderObject {
        TextureRegion tr;
        float stateTime;

        public MiddleGround(GameNode node) {
            super(node, "simple/wall.png");
            this.zIndex = 6;
            tr = new TextureRegion(this, 0,0,25,50);
        }

        @Override
        public void draw(SpriteBatch batch) {
            stateTime += Gdx.graphics.getDeltaTime();
            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
        }
    }

    class Doodad extends RenderObject {
        private TextureRegion wallr, walll;
        TextureRegion tr;
        TextureRegion[] trs;
        float stateTime;

        public Doodad(GameNode node) {
            super(node, "simple/floor.png");
            this.zIndex = 7;
            tr = new TextureRegion(this, 0,0,25,50);
            wallr = new TextureRegion(new Texture("simple/wallr.png"), 0,0,25,50);
            walll = new TextureRegion(new Texture("simple/walll.png"), 0,0,25,50);

        }

        @Override
        public void draw(SpriteBatch batch) {
            stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);

            Ship s = (Ship) myNode.parent;

            Vector3 rotup = new Vector3(0,50,0).rotate(NodeHolder.rotAxis, ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);
            Vector3 rotdn = new Vector3(0,-50,0).rotate(NodeHolder.rotAxis, ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);

            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y)).type == TileType.Hull) {
                batch.draw(wallr, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, (((Tile) myNode).y)).type == TileType.Hull) {
                batch.draw(walll, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
        }
    }
}
