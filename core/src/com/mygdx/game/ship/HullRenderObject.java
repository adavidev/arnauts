package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
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

        Background bg = new Background(node);
        MiddleGround mg = new MiddleGround(node);

        RenderManager.sort();
    }

    class Background extends RenderObject {
        TextureRegion tr;
        float stateTime;

        public Background(GameNode node) {
            super(node, "hullR.png");
            this.zIndex = 5;
            tr = new TextureRegion(this, 0,0,25,50);
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
            super(node, "hullR.png");
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
}
