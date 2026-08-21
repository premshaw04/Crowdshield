from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User, Role
from app.repositories.gate_repository import GateRepository
from app.schemas.gate import GateUpdate, GateResponse
from app.services.gate_simulation import gate_simulation_service

router = APIRouter()

@router.get("/{gate_id}", response_model=GateResponse)
def read_gate(
    gate_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = GateRepository(db)
    gate = repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    return gate

@router.patch("/{gate_id}", response_model=GateResponse)
def update_gate(
    gate_id: str,
    gate_in: GateUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = GateRepository(db)
    gate = repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
        
    gate = repo.update(db_obj=gate, obj_in=gate_in)
    return gate

@router.delete("/{gate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gate(
    gate_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = GateRepository(db)
    gate = repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    repo.delete(id=gate_id)

@router.post("/{gate_id}/simulate/open", response_model=GateResponse)
def simulate_open_gate(
    gate_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Simulate opening a physical gate (DEMO/SIMULATION).
    """
    if current_user.role not in [Role.AUTHORITY, Role.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to control gates")
        
    repo = GateRepository(db)
    gate = repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
        
    return gate_simulation_service.simulate_open(db, gate, current_user.id, background_tasks)

@router.post("/{gate_id}/simulate/close", response_model=GateResponse)
def simulate_close_gate(
    gate_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Simulate closing a physical gate (DEMO/SIMULATION).
    """
    if current_user.role not in [Role.AUTHORITY, Role.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to control gates")
        
    repo = GateRepository(db)
    gate = repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
        
    return gate_simulation_service.simulate_close(db, gate, current_user.id, background_tasks)
