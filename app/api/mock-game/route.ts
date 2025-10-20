import { NextRequest, NextResponse } from "next/server";
import { GameActionType, GameState } from "@/types/game";
import { processMockAction } from "@/lib/mockGameApi";

interface RequestBody {
  action: GameActionType;
  amount?: number;
  state: GameState;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body?.action || !body?.state) {
      return NextResponse.json(
        { error: "Missing action or state" },
        { status: 400 }
      );
    }

    const updatedState = processMockAction(body.action, body.state);

    return NextResponse.json({
      success: true,
      gameState: updatedState,
    });
  } catch (error) {
    console.error("Mock API request failed:", error);
    return NextResponse.json(
      { error: "Failed to process mock game action" },
      { status: 500 }
    );
  }
}
