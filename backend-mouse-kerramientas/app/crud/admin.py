from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..models.admin_log import AdminLog
from ..models.backup_config import BackupConfig
from ..schemas.admin import AdminLogCreate, BackupConfigCreate, BackupConfigUpdate


def create_admin_log(
    db: Session, 
    log: AdminLogCreate, 
    admin_id: int, 
    admin_username: str,
    ip_address: Optional[str] = None
) -> AdminLog:
    db_log = AdminLog(
        admin_id=admin_id,
        admin_username=admin_username,
        action=log.action,
        resource=log.resource,
        resource_id=log.resource_id,
        details=log.details,
        ip_address=ip_address
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_admin_logs(db: Session, skip: int = 0, limit: int = 100) -> List[AdminLog]:
    return db.query(AdminLog).order_by(desc(AdminLog.created_at)).offset(skip).limit(limit).all()


def get_admin_logs_by_admin(db: Session, admin_id: int, skip: int = 0, limit: int = 100) -> List[AdminLog]:
    return db.query(AdminLog).filter(AdminLog.admin_id == admin_id).order_by(desc(AdminLog.created_at)).offset(skip).limit(limit).all()


def create_backup_config(db: Session, config: BackupConfigCreate, created_by: int) -> BackupConfig:
    db_config = BackupConfig(
        name=config.name,
        description=config.description,
        config_data=config.config_data,
        created_by=created_by
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


def get_backup_configs(db: Session, skip: int = 0, limit: int = 100) -> List[BackupConfig]:
    return db.query(BackupConfig).offset(skip).limit(limit).all()


def get_backup_config(db: Session, config_id: int) -> Optional[BackupConfig]:
    return db.query(BackupConfig).filter(BackupConfig.id == config_id).first()


def update_backup_config(db: Session, config_id: int, config_update: BackupConfigUpdate) -> Optional[BackupConfig]:
    db_config = db.query(BackupConfig).filter(BackupConfig.id == config_id).first()
    if db_config:
        update_data = config_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db.commit()
        db.refresh(db_config)
    return db_config


def delete_backup_config(db: Session, config_id: int) -> bool:
    db_config = db.query(BackupConfig).filter(BackupConfig.id == config_id).first()
    if db_config:
        db.delete(db_config)
        db.commit()
        return True
    return False
