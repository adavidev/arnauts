package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.mygdx.game.core.ARandom;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderManager;
import com.mygdx.game.core.RenderObject;

/**
 * Created by al on 5/15/2016.
 */
public class CleanCorridorRenderObject {

        public CleanCorridorRenderObject(GameNode node) {

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
            TextureRegion tr;
            TextureRegion[] trs;
            float stateTime;

            public Doodad(GameNode node) {
                super(node, "simple/floor.png");
                this.zIndex = 7;
                tr = new TextureRegion(this, 0,0,25,50);

            }

            @Override
            public void draw(SpriteBatch batch) {
                stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
                batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
        }

}
