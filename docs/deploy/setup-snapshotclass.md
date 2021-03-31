---
id: setup-snapshotclass
title: Setup SnapshotClass
sidebar_label: Setup SnapshotClass
---

[Kubernetes VolumeSnapshotClass](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/) objects are analogous to StorageClasses. They help define multiple classes of storage and are referenced by Volume Snapshots to associate the snapshot with the required Snapshot Class. Each Volume Snapshot is associated with a single Volume Snapshot Class.

A Volume Snapshot Class is created with this definition:

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
driver: com.iomesh.csi-driver  # <-- driver.name in iomesh-values.yaml
deletionPolicy: Retain
```
