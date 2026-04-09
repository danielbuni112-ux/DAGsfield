"""
CutAI Export Router
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json
import xml.etree.ElementTree as ET
from io import StringIO

from ..models.database import get_db, Project, Scene, Script
from ..models.schemas import ExportRequest

router = APIRouter()


@router.post("/json")
def export_json(data: ExportRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = db.query(Scene).filter(Scene.project_id == data.project_id).order_by(Scene.order_index).all()
    script = db.query(Script).filter(Script.project_id == data.project_id).first()
    
    export_data = {
        "project": {
            "id": project.id,
            "name": project.name,
            "genre": project.genre,
            "premise": project.premise,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None
        },
        "script": script.raw_script if script else None,
        "scenes": [
            {
                "id": scene.id,
                "scene_number": scene.scene_number,
                "description": scene.description,
                "shot_type": scene.shot_type,
                "camera_angle": scene.camera_angle,
                "camera_movement": scene.camera_movement,
                "duration": scene.duration,
                "mood": {
                    "tension": scene.mood_tension,
                    "emotion": scene.mood_emotion,
                    "energy": scene.mood_energy,
                    "darkness": scene.mood_darkness
                },
                "soundtrack": {
                    "genre": scene.soundtrack_genre,
                    "tempo": scene.soundtrack_tempo,
                    "instruments": scene.soundtrack_instruments,
                    "reference": scene.soundtrack_reference
                }
            }
            for scene in scenes
        ]
    }
    
    return JSONResponse(content=export_data)


@router.post("/pdf")
def export_pdf(data: ExportRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = db.query(Scene).filter(Scene.project_id == data.project_id).order_by(Scene.order_index).all()
    script = db.query(Script).filter(Script.project_id == data.project_id).first()
    
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<storyboard>
  <project>
    <name>{project.name}</name>
    <genre>{project.genre or 'N/A'}</genre>
    <premise>{project.premise or 'N/A'}</premise>
  </project>
  <script>
{json.dumps(json.loads(script.raw_script), indent=2) if script and script.raw_script else 'No script'}
  </script>
  <scenes>
"""
    
    for scene in scenes:
        xml_content += f"""    <scene>
      <number>{scene.scene_number}</number>
      <description>{scene.description}</description>
      <shot_type>{scene.shot_type or 'N/A'}</shot_type>
      <camera_angle>{scene.camera_angle or 'N/A'}</camera_angle>
      <camera_movement>{scene.camera_movement or 'N/A'}</camera_movement>
      <duration>{scene.duration}</duration>
      <mood>
        <tension>{scene.mood_tension}</tension>
        <emotion>{scene.mood_emotion}</emotion>
        <energy>{scene.mood_energy}</energy>
        <darkness>{scene.mood_darkness}</darkness>
      </mood>
      <soundtrack>
        <genre>{scene.soundtrack_genre or 'N/A'}</genre>
        <tempo>{scene.soundtrack_tempo or 'N/A'}</tempo>
        <reference>{scene.soundtrack_reference or 'N/A'}</reference>
      </soundtrack>
    </scene>
"""
    
    xml_content += """  </scenes>
</storyboard>"""
    
    return JSONResponse(content={"xml": xml_content, "message": "PDF export ready (XML format)"})
