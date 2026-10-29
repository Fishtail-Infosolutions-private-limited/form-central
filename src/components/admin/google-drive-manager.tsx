"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Folder,
  FolderPlus,
  RefreshCw,
  LogOut,
  ChevronRight,
  ExternalLink,
  Loader2,
  FolderCheck,
  ShieldCheck,
  Users,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listDriveFoldersAction,
  createDriveFolderAction,
  selectDriveFolderAction,
  disconnectDriveAction,
  listConnectedDriveAccountsAction,
  switchActiveDriveAccountAction,
  removeSavedDriveAccountAction,
} from "@/server/actions/google-drive-actions";
import { toast } from "sonner";

interface DriveFile {
  id?: string | null;
  name?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
}

interface IntegrationProps {
  integration: {
    isConnected: boolean;
    accountEmail: string | null;
    folderId: string | null;
    folderName: string | null;
    lastConnectedAt: Date | null;
  } | null;
  initialError?: string | null;
  initialSuccess?: boolean;
}

export function GoogleDriveManager({
  integration,
  initialError,
  initialSuccess,
}: IntegrationProps) {
  const isConnected = Boolean(integration?.isConnected);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [folders, setFolders] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<{ id?: string; name: string }[]>([
    { name: "My Drive" },
  ]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    integration?.folderId || null
  );
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
    integration?.folderName || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Saved / Previous Accounts State
  const [showAccountsList, setShowAccountsList] = useState(false);
  const [accountsList, setAccountsList] = useState<
    Array<{
      email: string;
      folderName: string | null;
      folderId: string | null;
      lastConnectedAt: Date | null;
      isCurrentlyActive: boolean;
    }>
  >([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    const res = await listConnectedDriveAccountsAction();
    setIsLoadingAccounts(false);
    if (res.success && res.accounts) {
      setAccountsList(res.accounts);
    }
  };

  const handleToggleAccountsList = () => {
    const next = !showAccountsList;
    setShowAccountsList(next);
    if (next) {
      fetchAccounts();
    }
  };

  const handleSwitchAccount = async (email: string) => {
    setIsSwitchingAccount(email);
    const res = await switchActiveDriveAccountAction(email);
    setIsSwitchingAccount(null);
    if (res.success) {
      toast.success(`Switched active Google Drive account to ${email}`);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to switch account");
    }
  };

  const handleRemoveAccount = async (email: string) => {
    if (!confirm(`Remove saved account ${email} from list?`)) return;
    const res = await removeSavedDriveAccountAction(email);
    if (res.success) {
      toast.success(`Account ${email} removed`);
      fetchAccounts();
    } else {
      toast.error(res.error || "Failed to remove account");
    }
  };
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    initialError
      ? { type: "error", text: initialError }
      : initialSuccess
      ? { type: "success", text: "Google Drive connected successfully! Now select or create a destination folder below." }
      : null
  );

  const fetchFolders = async (parentId?: string) => {
    setIsLoadingFolders(true);
    const res = await listDriveFoldersAction(parentId);
    setIsLoadingFolders(false);
    if (res.success && res.folders) {
      setFolders(res.folders);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load Google Drive folders" });
    }
  };

  const handleOpenBrowser = () => {
    setIsBrowsing(true);
    setCurrentFolderId(undefined);
    setFolderHistory([{ name: "My Drive" }]);
    fetchFolders(undefined);
  };

  const handleNavigateFolder = (folder: DriveFile) => {
    if (!folder.id || !folder.name) return;
    setCurrentFolderId(folder.id);
    setFolderHistory((prev) => [...prev, { id: folder.id!, name: folder.name! }]);
    fetchFolders(folder.id);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderHistory[index];
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(target.id);
    fetchFolders(target.id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    const res = await createDriveFolderAction(newFolderName.trim(), currentFolderId);
    setIsCreatingFolder(false);

    if (res.success && res.folder) {
      setNewFolderName("");
      setMessage({
        type: "success",
        text: `Folder "${res.folder.name}" created successfully on Google Drive!`,
      });
      // Auto select newly created folder
      if (res.folder.id && res.folder.name) {
        handleSelectFolder(res.folder.id, res.folder.name);
      }
      fetchFolders(currentFolderId);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create folder" });
    }
  };

  const handleSelectFolder = async (folderId: string, folderName: string) => {
    setIsSaving(true);
    const res = await selectDriveFolderAction(folderId, folderName);
    setIsSaving(false);
    if (res.success) {
      setSelectedFolderId(folderId);
      setSelectedFolderName(folderName);
      setIsBrowsing(false);
      setMessage({
        type: "success",
        text: `Destination folder set to "${folderName}". Registrant videos will be uploaded directly here.`,
      });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save selected folder" });
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Drive? Videos will not be accepted until reconnected."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    const res = await disconnectDriveAction();
    setIsDisconnecting(false);
    if (res.success) {
      setSelectedFolderId(null);
      setSelectedFolderName(null);
      setIsBrowsing(false);
      setMessage({ type: "success", text: "Google Drive disconnected successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to disconnect" });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Status Card */}
      <Card className="border-zinc-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-zinc-50/70 border-b border-zinc-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 p-0.5 flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-zinc-800">
                  <HardDrive className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
                  <span>Google Drive Video Storage</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-zinc-100 text-zinc-600 border-zinc-200"
                    }`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Store participant video submissions securely in your personal or organizational Google Drive.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAccountsList}
                className="text-xs gap-1.5 border-zinc-300 text-zinc-700 hover:text-black"
              >
                <Users className="w-3.5 h-3.5 text-zinc-600" />
                <span>{showAccountsList ? "Hide Account List" : "Show All Accounts"}</span>
              </Button>

              <a href="/api/google-drive/auth">
                <Button
                  className={`text-xs font-semibold gap-1.5 ${
                    !isConnected
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-black hover:bg-zinc-800 text-white"
                  }`}
                  size="sm"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isConnected ? "Change Account" : "Connect Account"}</span>
                </Button>
              </a>

              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Saved / Previous Accounts List Drawer */}
          {showAccountsList && (
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/90 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-zinc-900">
                    Connected & Previous Google Accounts ({accountsList.length})
                  </h4>
                </div>
                <a href="/api/google-drive/auth">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 font-semibold gap-1">
                    <span>+ Connect New Account</span>
                  </Button>
                </a>
              </div>

              {isLoadingAccounts ? (
                <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading account history...</span>
                </div>
              ) : accountsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No other accounts found. Click <strong>&quot;+ Connect New Account&quot;</strong> to link an additional Google Drive account.
                </div>
              ) : (
                <div className="space-y-2">
                  {accountsList.map((acc) => (
                    <div
                      key={acc.email}
                      className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        acc.isCurrentlyActive
                          ? "bg-emerald-50/70 border-emerald-200"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-900 truncate">
                            {acc.email}
                          </span>
                          {acc.isCurrentlyActive && (
                            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Destination Folder: <strong>{acc.folderName || "Not configured"}</strong>
                          {acc.lastConnectedAt && (
                            <span> &bull; Connected {new Date(acc.lastConnectedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!acc.isCurrentlyActive && (
                          <Button
                            size="sm"
                            onClick={() => handleSwitchAccount(acc.email)}
                            disabled={isSwitchingAccount === acc.email}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 font-semibold gap-1"
                          >
                            {isSwitchingAccount === acc.email ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRightLeft className="w-3 h-3" />
                            )}
                            <span>Switch to this Account</span>
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(acc.email)}
                          className="text-zinc-400 hover:text-red-600 p-1 rounded"
                          title="Remove from saved accounts"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!isConnected ? (
            <div className="text-center py-8 space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Google Drive is not connected</h3>
              <p className="text-xs text-zinc-500">
                Click <strong>&quot;Connect Account&quot;</strong> above to sign in with your Google account. You will then be able to choose or create a destination folder where video submissions will be saved.
              </p>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-left text-xs text-zinc-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Single Administrator OAuth Security</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Only you (the event administrator) authenticate. Public registrants are never prompted for Google accounts. All videos remain private in your chosen folder.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Connected Google Account
                  </span>
                  <div className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{integration?.accountEmail || "Active Session"}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Access token refreshed automatically in the background
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Destination Folder
                    </span>
                    {selectedFolderId && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {selectedFolderId ? (
                    <div className="space-y-2">
                      <div className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <FolderCheck className="w-5 h-5 text-emerald-600" />
                        <span>{selectedFolderName || "Configured Folder"}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleOpenBrowser}
                          className="h-8 text-xs font-semibold gap-1 border-zinc-300"
                        >
                          <Folder className="w-3.5 h-3.5" />
                          <span>Change Folder</span>
                        </Button>
                        <a
                          href={`https://drive.google.com/drive/folders/${selectedFolderId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-zinc-500 hover:text-emerald-600 flex items-center gap-1 font-medium"
                        >
                          <span>Open in Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-zinc-600" />
                        <span>No destination folder selected yet</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleOpenBrowser}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 font-semibold gap-1"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Select or Create Folder</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Folder Browser Modal / Inline Section */}
              {isBrowsing && (
                <div className="mt-6 p-5 rounded-xl border border-zinc-300 bg-white shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-emerald-600" />
                        <span>Select Destination Folder on Google Drive</span>
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Browse your Drive, choose an existing folder, or create a brand new one.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBrowsing(false)}
                      className="text-xs"
                    >
                      Close Browser
                    </Button>
                  </div>

                  {/* Create New Folder Form */}
                  <form onSubmit={handleCreateFolder} className="flex gap-2">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder='New folder name, e.g. "Participant Videos"'
                      className="text-xs h-9 border-zinc-300"
                    />
                    <Button
                      type="submit"
                      disabled={isCreatingFolder || !newFolderName.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 shrink-0 gap-1 font-semibold"
                    >
                      {isCreatingFolder ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FolderPlus className="w-3.5 h-3.5" />
                      )}
                      <span>Create Folder</span>
                    </Button>
                  </form>

                  {/* Breadcrumb Navigation */}
                  <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-200 overflow-x-auto">
                    {folderHistory.map((item, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />}
                        <button
                          type="button"
                          onClick={() => handleNavigateBreadcrumb(idx)}
                          className={`hover:text-emerald-700 font-medium whitespace-nowrap px-1 py-0.5 rounded ${
                            idx === folderHistory.length - 1
                              ? "font-bold text-zinc-900 bg-white shadow-2xs"
                              : "text-zinc-600"
                          }`}
                        >
                          {item.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Folder Listing */}
                  <div className="min-h-[160px] max-h-[300px] overflow-y-auto divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                    {isLoadingFolders ? (
                      <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Loading Google Drive folders...</span>
                      </div>
                    ) : folders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        No subfolders found in this directory. You can create a new folder using the input above.
                      </div>
                    ) : (
                      folders.map((folder) => {
                        const isCurrentSelected = selectedFolderId === folder.id;
                        return (
                          <div
                            key={folder.id}
                            className={`p-3 flex items-center justify-between hover:bg-zinc-50 transition-colors ${
                              isCurrentSelected ? "bg-emerald-50/50" : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleNavigateFolder(folder)}
                              className="flex items-center gap-2.5 text-left font-medium text-xs text-zinc-800 hover:text-emerald-700 flex-1 min-w-0"
                            >
                              <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {isCurrentSelected ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Selected</span>
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={isSaving}
                                  onClick={() => handleSelectFolder(folder.id!, folder.name!)}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5"
                                >
                                  Select Destination
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

