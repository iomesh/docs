---
id: setup-snapshotclass
title: Setup SnapshotClass
sidebar_label: Setup SnapshotClass
---

## Setting Up SnapshotClass

Each volume snapshot is bound to a SnapshotClass that describes the classes and types of snapshots when provisioning a volume snapshot. In IOMesh, a SnapshotClass is equivalent to a storage policy, in which you can specify `provisioner` and `deletionpolicy`.  `deletionpolicy` means whether you want to delete IOMesh volumes.

kubertes snapshot objects are deleted 
k8s 的快照对象删除了， 对应的 ZBS 快照是否要删除
快照创建完成后，如何确保数据一致性



需要写具体的步骤么

In this example, 

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
driver: com.iomesh.csi-driver  # <-- driver.name in iomesh-values.yaml
deletionPolicy: Retain
```

