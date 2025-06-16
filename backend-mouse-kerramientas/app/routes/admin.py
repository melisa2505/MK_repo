import json
import os
from datetime import datetime, timedelta
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..crud import admin as crud_admin, user as crud_user
from ..crud.tool import get_tools
from ..database.database import get_db
from ..dependencies import get_current_admin_user
from ..models.admin_log import AdminLog
from ..models.tool import Tool, ToolCondition
from ..models.user import User
from ..schemas.admin import (
    AdminDashboard, AdminLog as AdminLogSchema, AdminLogCreate,
    BackupConfig, BackupConfigCreate, BackupConfigUpdate,
    ToolStats, UserStats
)

router = APIRouter()


@router.get("/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    
    tool_count = db.query(Tool).count()
    available_tools = db.query(Tool).filter(Tool.is_available == True).count()
    rented_tools = tool_count - available_tools
    
    tools_by_category = dict(
        db.query(Tool.category, func.count(Tool.id))
        .group_by(Tool.category)
        .all()
    )
    
    tools_by_condition = dict(
        db.query(Tool.condition, func.count(Tool.id))
        .group_by(Tool.condition)
        .all()
    )
    
    user_count = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.is_superuser == True).count()
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_registrations = db.query(User).filter(User.created_at >= week_ago).count()
    
    recent_logs = crud_admin.get_admin_logs(db, limit=10)
    
    tool_stats = ToolStats(
        total_tools=tool_count,
        available_tools=available_tools,
        rented_tools=rented_tools,
        tools_by_category=tools_by_category,
        tools_by_condition=tools_by_condition
    )
    
    user_stats = UserStats(
        total_users=user_count,
        active_users=active_users,
        admin_users=admin_users,
        recent_registrations=recent_registrations
    )
    
    return AdminDashboard(
        tool_stats=tool_stats,
        user_stats=user_stats,
        recent_logs=recent_logs
    )


@router.get("/logs", response_model=List[AdminLogSchema])
async def get_logs(
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud_admin.get_admin_logs(db, skip=skip, limit=limit)


@router.post("/logs", response_model=AdminLogSchema)
async def create_log(
    log: AdminLogCreate,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else None
    return crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )


@router.get("/backup-configs", response_model=List[BackupConfig])
async def get_backup_configs(
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud_admin.get_backup_configs(db, skip=skip, limit=limit)


@router.post("/backup-configs", response_model=BackupConfig)
async def create_backup_config(
    config: BackupConfigCreate,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    db_config = crud_admin.create_backup_config(db=db, config=config, created_by=current_admin.id)
    
    log = AdminLogCreate(
        action="CREATE",
        resource="backup_config",
        resource_id=str(db_config.id),
        details=f"Created backup config: {config.name}"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return db_config


@router.put("/backup-configs/{config_id}", response_model=BackupConfig)
async def update_backup_config(
    config_id: int,
    config_update: BackupConfigUpdate,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    db_config = crud_admin.update_backup_config(db=db, config_id=config_id, config_update=config_update)
    if not db_config:
        raise HTTPException(status_code=404, detail="Backup config not found")
    
    log = AdminLogCreate(
        action="UPDATE",
        resource="backup_config",
        resource_id=str(config_id),
        details=f"Updated backup config: {db_config.name}"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return db_config


@router.delete("/backup-configs/{config_id}")
async def delete_backup_config(
    config_id: int,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    deleted = crud_admin.delete_backup_config(db=db, config_id=config_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Backup config not found")
    
    log = AdminLogCreate(
        action="DELETE",
        resource="backup_config",
        resource_id=str(config_id),
        details="Deleted backup config"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return {"message": "Backup config deleted successfully"}


@router.post("/backup/create")
async def create_backup(
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    try:
        backup_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "created_by": current_admin.username,
            "tools": [tool.__dict__ for tool in get_tools(db)],
            "users": [user.__dict__ for user in crud_user.get_users(db)],
            "backup_configs": [config.__dict__ for config in crud_admin.get_backup_configs(db)]
        }
        
        backup_filename = f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        backup_path = f"backups/{backup_filename}"
        
        os.makedirs("backups", exist_ok=True)
        
        with open(backup_path, 'w') as f:
            json.dump(backup_data, f, default=str, indent=2)
        
        log = AdminLogCreate(
            action="BACKUP",
            resource="system",
            details=f"Created system backup: {backup_filename}"
        )
        client_ip = request.client.host if request.client else None
        crud_admin.create_admin_log(
            db=db,
            log=log,
            admin_id=current_admin.id,
            admin_username=current_admin.username,
            ip_address=client_ip
        )
        
        return {"message": "Backup created successfully", "filename": backup_filename}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating backup: {str(e)}")


@router.get("/backup/list")
async def list_backups(
    current_admin: Annotated[User, Depends(get_current_admin_user)]
):
    try:
        backup_dir = "backups"
        if not os.path.exists(backup_dir):
            return {"backups": []}
        
        backups = []
        for filename in os.listdir(backup_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(backup_dir, filename)
                stat = os.stat(filepath)
                backups.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat()
                })
        
        return {"backups": sorted(backups, key=lambda x: x["created_at"], reverse=True)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing backups: {str(e)}")


@router.post("/backup/restore/{filename}")
async def restore_backup(
    filename: str,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    try:
        backup_path = f"backups/{filename}"
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        log = AdminLogCreate(
            action="RESTORE",
            resource="system",
            details=f"Restored system from backup: {filename}"
        )
        client_ip = request.client.host if request.client else None
        crud_admin.create_admin_log(
            db=db,
            log=log,
            admin_id=current_admin.id,
            admin_username=current_admin.username,
            ip_address=client_ip
        )
        
        return {"message": f"Backup {filename} restored successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error restoring backup: {str(e)}")
