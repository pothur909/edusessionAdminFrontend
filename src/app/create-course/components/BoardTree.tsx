"use client";

import React, { useEffect, useState } from "react";
import {
  fetchBoardTree,
  updateBoardTree,
  deleteFromBoardTree,
  updateSearchCards,
} from "../../../services/adminServices";
import TreeView from "./TreeView";
import UpdateForm from "./UpdateFrom";

const BoardTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTree = async () => {
    try {
      const data = await fetchBoardTree();
      setTreeData(data);
    } catch (error) {
      console.log("error fetching tree", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleUpdateTree = async (board, className, subject) => {
    await updateBoardTree({ board, className, subject });
    await fetchTree(); // Refresh after update
  };

  const handleDelete = async (board, className, subject) => {
    await deleteFromBoardTree({ board, className, subject });
    await fetchTree();
  };

  const handleUpdateSearchCards = async () => {
    await updateSearchCards();
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        .......Loading board Tree
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4">
      <div className="bg-white max-w-4xl mx-auto rounded-3xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            📚 Board Tree Structure
          </h2>
          <button
            onClick={handleUpdateSearchCards}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            🔄 Update Search Cards
          </button>
        </div>

        {treeData?.length > 0 ? (
          <TreeView
            data={treeData}
            onUpdate={handleUpdateTree}
            onDelete={handleDelete}
          />
        ) : (
          <div>
            <p className="text-center pt-20 text-gray-600">no board tree</p>
            <UpdateForm onSubmit={handleUpdateTree} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardTree;
