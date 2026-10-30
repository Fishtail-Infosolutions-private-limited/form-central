"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Folder,
  FolderPlus,
  RefreshCw,
  LogOut,
  ChevronRight,
  ExternalLink,
  Loader2,
  FolderCheck,
  ShieldCheck,
  Trash2,
  ArrowRightLeft,
  X,
  History,
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
  const [isConnected, setIsConnected] = useState(Boolean(integration?.isConnected));
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
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Previous Accounts History State
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    const res = await listConnectedDriveAccountsAction();
    setIsLoadingAccounts(false);
    if (res.success && res.accounts) {
      setAccountsList(res.accounts);
    }
  };

  const handleRemoveAccountHistory = async (email: string) => {
    const res = await removeSavedDriveAccountAction(email);
    if (res.success) {
      toast.success(`Account record ${email} removed from history`);
      fetchAccounts();
    } else {
      toast.error(res.error || "Failed to remove account record");
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
      toast.success(`Destination folder set to "${folderName}"`);
      setMessage({
        type: "success",
        text: `Destination folder set to "${folderName}". Registrant videos will be uploaded directly here.`,
      });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save selected folder" });
    }
  };

  const executeDisconnect = async () => {
    setIsDisconnecting(true);
    const res = await disconnectDriveAction();
    setIsDisconnecting(false);
    setShowDisconnectModal(false);

    if (res.success) {
      setIsConnected(false);
      setSelectedFolderId(null);
      setSelectedFolderName(null);
      setIsBrowsing(false);
      toast.success("Google Drive disconnected properly");
      setMessage({
        type: "success",
        text: "Google Drive has been disconnected. Video uploads will be paused until an account is reconnected.",
      });
      fetchAccounts();
    } else {
      toast.error(res.error || "Failed to disconnect Google Drive");
      setMessage({ type: "error", text: res.error || "Failed to disconnect" });
    }
  };

  // Only previous / historical accounts (excluding active account if connected)
  const previousAccounts = accountsList.filter(
    (acc) => !isConnected || acc.email !== integration?.accountEmail
  );

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

      {/* Main Connection Card */}
      <Card className="border-zinc-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-zinc-50/70 border-b border-zinc-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 p-0.5 flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-zinc-800">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
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

            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <a href="/api/google-drive/auth">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold gap-1.5 border-zinc-300 text-zinc-700 hover:text-black"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Change Account</span>
                    </Button>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDisconnectModal(true)}
                    className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 gap-1 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </Button>
                </>
              ) : (
                <a href="/api/google-drive/auth">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-4 shadow-xs"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Connect Google Drive</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!isConnected ? (
            /* DISCONNECTED STATE */
            <div className="space-y-6">
              <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center border border-zinc-200">
                  <HardDrive className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-zinc-900 text-base">
                    Google Drive is currently disconnected
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    To receive and store participant video submissions, connect your personal or organizational Google Drive account. Re-linking will guide you through Google OAuth authentication from the start.
                  </p>
                </div>

                <a href="/api/google-drive/auth" className="inline-block">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 gap-2 shadow-sm">
                    <HardDrive className="w-4 h-4" />
                    <span>Connect Account with Google</span>
                  </Button>
                </a>
              </div>

              {/* Previously Linked Accounts History (Reference Only - No Switch Button) */}
              {previousAccounts.length > 0 && (
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                    <History className="w-4 h-4 text-zinc-500" />
                    <h4 className="text-xs font-bold text-zinc-800">
                      Previous Account History ({previousAccounts.length})
                    </h4>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Accounts previously connected to this system. To reconnect any account, click <strong>&quot;Connect Account with Google&quot;</strong> above to sign in cleanly with Google.
                  </p>

                  <div className="space-y-2">
                    {previousAccounts.map((acc) => (
                      <div
                        key={acc.email}
                        className="p-3 rounded-lg border border-zinc-200 bg-white text-xs flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 truncate">
                              {acc.email}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                              Disconnected
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {acc.lastConnectedAt && (
                              <span>Last linked on {new Date(acc.lastConnectedAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAccountHistory(acc.email)}
                          className="text-zinc-400 hover:text-red-600 p-1.5 rounded hover:bg-zinc-100 transition-colors"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CONNECTED STATE */
            <div className="space-y-6">
              {/* Account & Destination Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Connected Google Account
                  </span>
                  <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono truncate">{integration?.accountEmail}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Connected &bull; Video files stream directly here
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Active Destination Folder
                  </span>
                  <div className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{selectedFolderName || "Root Drive"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenBrowser}
                      className="h-7 text-xs border-zinc-300 font-semibold shrink-0"
                    >
                      Change Folder
                    </Button>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Target folder for uploads
                  </span>
                </div>
              </div>

              {/* Folder Browser Modal / Inline Section */}
              {isBrowsing && (
                <div className="mt-4 p-5 rounded-xl border border-zinc-300 bg-white shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-emerald-600" />
                        <span>Select Destination Folder on Google Drive</span>
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Choose an existing folder or create a new folder for your event videos.
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
                      placeholder='New folder name, e.g. "Event Videos 2026"'
                      className="text-xs h-9 border-zinc-300 bg-white"
                    />
                    <Button
                      type="submit"
                      disabled={isCreatingFolder || !newFolderName.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 shrink-0 gap-1 font-semibold text-white"
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
                  <div className="min-h-[160px] max-h-[280px] overflow-y-auto divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                    {isLoadingFolders ? (
                      <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Loading Google Drive folders...</span>
                      </div>
                    ) : folders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        No subfolders found in this directory. Create one using the input above.
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

      {/* Disconnect Confirmation UI Modal (Replaces browser alert) */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                Disconnect Google Drive?
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Video uploads from participants will immediately pause across all forms. If you want to link an account again later, you will need to authenticate from scratch via Google OAuth.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Connected Account</span>
                <span className="font-mono font-semibold text-zinc-900 truncate block">
                  {integration?.accountEmail}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDisconnectModal(false)}
                disabled={isDisconnecting}
                className="flex-1 text-xs font-semibold h-10 border-zinc-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeDisconnect}
                disabled={isDisconnecting}
                className="flex-1 text-xs font-bold h-10 bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Yes, Disconnect</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
