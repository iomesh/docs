---
id: create-snapshotclass
title: Creating SnapshotClass
sidebar_label: Creating SnapshotClass
---

A VolumeSnapshot is a snapshot of an existing PV on the storage system, and each VolumeSnapshot is bound to a SnapshotClass that describes the class and type of snapshots when provisioning a VolumeSnapshot.

A SnapshotClass in IOMesh is equivalent to a storage policy that specifies parameters like `provisioner` and `deletionpolicy` to use when taking a snapshot. Just like `iomesh-csi-driver` as a default StorageClass, a default SnapshotClass will be created at the same time when IOMesh is installed and cannot be modified. You can also create new SnapshotClasses with customized parameters.


### Viewing Default SnapshotClass
需要补充【查看默认 SnapshotClass 】的内容，参考【查看默认 StorageClass】


### Creating SnapshotClass
If the default SnapshotClass does not meet usage requirements, you can create a new one and specify fields `driver` and `deletionpolicy`.  

**Procedure**
1. Create a YAML file and specify the field `driver`. 

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
driver: com.iomesh.csi-driver  # The driver name in iomesh.yaml during manual installation.
deletionPolicy: Retain # Whether you want to delete IOMesh volumes.
```

2. Run the following command to apply the YAML file.
  
```
kubectl apply -f sc.yaml # 这里的命令直接 copy 的存储类，需要检查一下 yaml 文件名是否正确
```
