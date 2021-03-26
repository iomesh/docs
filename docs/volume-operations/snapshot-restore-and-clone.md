---
id: snapshot-restore-and-clone
title: Snapshot, Restore And Clone
sidebar_label: Snapshot, Restore And Clone
---

## Snapshot

IOMesh provides the ability to create a snapshot of an existing persistent volume.

A VolumeSnapshot object defines a request of taking a snapshot of the PVC.

For example:

```text
example-snapshot.yaml
```

```output
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: example-snapshot
spec:
  volumeSnapshotClassName: iomesh-csi-driver-default
  source:
    persistentVolumeClaimName: mongodb-data-pvc # PVC name that want to take snapshot
```

Apply the YAML file:

```text
kubectl apply -f example-snapshot.yaml
```

After VolumeSnapshot object created, a corresponding VolumeSnapshotContent will be created by IOMesh.

```bash
kubectl get Volumesnapshots example-snapshot
```

```output
NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
```

## Restore

User can restore volume snapshots by creating a PVC which `dataSource` field reference to a snapshot.

For example:

```text
restore.yaml
```

```output
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-restore
clonespec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: example-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 6Gi
```

Apply the YAML file:

```bash
kubectl apply -f example-restore.yaml
```

## Clone

Users can clone a volume by create a PVC while adding a dataSource that linked to an existing PVC in the same namespace.

For example:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cloned-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: existing-pvc # an existing PVC in the same namespace
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  volumeMode: Block
```

After applying it, a clone of `existing-pvc` will be created.

There are some limitations on clone operation:

1. A cloned PVC must exist at the same namespace with the original PVC with same StorageClass.
2. The new and source PVC must have the same VolumeMode setting.
