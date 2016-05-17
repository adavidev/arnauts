package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderObject;

/**
 * Created by al on 5/17/2016.
 */
public class LadderRenderObject extends RenderObject {
    private final TextureRegion tr;

    public LadderRenderObject(GameNode node) {
        super(node, "tileset1.png");
        this.zIndex = 8;
        tr = new TextureRegion(this, 200, 0, 25,50);
    }

    @Override
    public void draw(SpriteBatch batch) {
//        stateTime += Gdx.graphics.getDeltaTime();
//            batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y);
        batch.draw(tr, myNode.globalPos.x,myNode.globalPos.y, 0,0,25,50,1,1,myNode.globalRot);
    }
}
