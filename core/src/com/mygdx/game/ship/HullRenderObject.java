package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.Vector3;
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

        private Texture hullb, hullempty, hulll, hullr, hullt, hullbl, hullbr, hulltl, hulltr;
        private TextureRegion trhullb, trhullempty, trhulll, trhullr, trhullt, trhullbl, trhullbr, trhulltl, trhulltr;

        public Hull(GameNode node) {
            super(node, "hullB.png");
            hullb = new Texture("hullB.png");
            hullempty = new Texture("hullEmpty.png");
            hulll = new Texture("hullL.png");
            hullr = new Texture("hullR.png");
            hullt = new Texture("hullT.png");
            hullbl = new Texture("hullBL.png");
            hullbr = new Texture("hullBR.png");
            hulltl = new Texture("hullTL.png");
            hulltr = new Texture("hullTR.png");

            trhullb = new TextureRegion(hullb);
            trhullempty = new TextureRegion(hullempty);
            trhulll = new TextureRegion(hulll);
            trhullr = new TextureRegion(hullr);
            trhullt = new TextureRegion(hullt);
            trhullbl = new TextureRegion(hullbl);
            trhullbr = new TextureRegion(hullbr);
            trhulltl = new TextureRegion(hulltl);
            trhulltr = new TextureRegion(hulltr);
        }

        @Override
        public void draw(SpriteBatch batch) {
            Ship s = (Ship) myNode.parent;
            Texture tr;

            Vector3 rotup = new Vector3(0,50,0).rotate(new Vector3(0,0,1), ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);
            Vector3 rotdn = new Vector3(0,-50,0).rotate(new Vector3(0,0,1), ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);

            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y)).type == TileType.Corridor) {
                batch.draw(trhulll, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, ((Tile) myNode).y).type == TileType.Corridor) {
                batch.draw(trhullr, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.Corridor) {
                batch.draw(trhullb, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.Corridor) {
                batch.draw(trhullt, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y - 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.None) {
                batch.draw(trhullbl, rotdn.x, rotdn.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, (((Tile) myNode).y - 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.None) {
                batch.draw(trhullbr, rotdn.x, rotdn.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y + 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.None) {
                batch.draw(trhulltl, rotup.x, rotup.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, (((Tile) myNode).y + 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.None) {
                batch.draw(trhulltr, rotup.x, rotup.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
        }
    }
}
