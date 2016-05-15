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

            Background bg = new Background(node);
            MiddleGround mg = new MiddleGround(node);
            Doodad doo = new Doodad(node);

            RenderManager.sort();
        }

        class Background extends RenderObject {
            TextureRegion tr;
            TextureRegion[] trs;
            float stateTime;

            public Background(GameNode node) {
                super(node, "tileset.png");
                this.zIndex = 5;
                trs = new TextureRegion[3];
                trs[0] = new TextureRegion(this, 75,50,25,50);
                trs[1] = new TextureRegion(this, 100,50,25,50);
                trs[2] = new TextureRegion(this, 125,50,25,50);
                tr = new TextureRegion(this, 125,50,25,50);

                tr = trs[ARandom.rand((int) System.currentTimeMillis(),3)];
            }

            @Override
            public void draw(SpriteBatch batch) {
                stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
                batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
        }

        class MiddleGround extends RenderObject {
            TextureRegion tr;
            float stateTime;

            public MiddleGround(GameNode node) {
                super(node, "tileset.png");
                this.zIndex = 6;
                TextureRegion[] trs = new TextureRegion[5];
                trs[0] = new TextureRegion(this, 0,50,25,50);
                trs[1] = new TextureRegion(this, 25,50,25,50);
                trs[2] = new TextureRegion(this, 25,50,25,50);
                trs[3] = new TextureRegion(this, 25,50,25,50);
                trs[4] = new TextureRegion(this, 50,50,25,50);
                tr = new TextureRegion(this, 0,50,25,50);

                tr = trs[ARandom.rand((int) System.currentTimeMillis(),trs.length)];
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
                super(node, "tileset.png");
                this.zIndex = 7;
                trs = new TextureRegion[6];
                trs[0] = new TextureRegion(this, 275,50,25,50);
                trs[1] = new TextureRegion(this, 300,50,25,50);
                trs[2] = new TextureRegion(this, 450,50,25,50);
                trs[3] = new TextureRegion(this, 450,50,25,50);
                trs[4] = new TextureRegion(this, 450,50,25,50);
                trs[5] = new TextureRegion(this, 450,50,25,50);
                tr = new TextureRegion(this, 125,50,25,50);

                tr = trs[ARandom.rand((int) System.currentTimeMillis(), trs.length)];
            }

            @Override
            public void draw(SpriteBatch batch) {
                stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
                batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
            }
        }

}
