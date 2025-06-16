from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AdminLogBase(BaseModel):
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[str] = None


class AdminLogCreate(AdminLogBase):
    pass


class AdminLog(AdminLogBase):
    id: int
    admin_id: int
    admin_username: str
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BackupConfigBase(BaseModel):
    name: str
    description: Optional[str] = None
    config_data: str


class BackupConfigCreate(BackupConfigBase):
    pass


class BackupConfigUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config_data: Optional[str] = None
    is_active: Optional[bool] = None


class BackupConfig(BackupConfigBase):
    id: int
    created_by: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ToolStats(BaseModel):
    total_tools: int
    available_tools: int
    rented_tools: int
    tools_by_category: dict
    tools_by_condition: dict


class UserStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    recent_registrations: int


class AdminDashboard(BaseModel):
    tool_stats: ToolStats
    user_stats: UserStats
    recent_logs: list[AdminLog]
