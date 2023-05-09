---
id: create-storageclass
title: Create StorageClass
sidebar_label: Create StorageClass
---

IOMesh provides a default StorageClass `iomesh-csi-driver` that provides PVs for pods through dynamic volume provisioning. Its parameters adopt the default values in the table below and cannot be modified. If you want a StorageClass with custom parameters, refer to the following.

| Field |Description|Default (`iomesh-csi-driver`)|
|---|---|---|
|`provisioner`| The provisioner that determines what volume plugin is used for provisioning PVs. |`com.iomesh.csi-driver`|
|`reclaimPolicy`|<p>Determines whether PV is retained when the PVC is deleted.</p><p>`Delete`: When PVC is deleted, PV and the corresponding IOMesh volume will be deleted. <p>`Retain`: When PVC is deleted, PV and the corresponding IOMesh volume will be retained.|`delete`|
|`allowVolumeExpansion`|Shows if volume expansion support is enabled.| `true`|
|`csi.storage.k8s.io/fstype`|<p>The filesystem type, including</P>`xfs`, `ext2`, `ext3`, `ext4`|`ext4`|
|`replicaFactor` | The number of replicas for PVs, either `2` or `3`|`2`.|   
| `thinProvision` |<p>Shows the provisioning type.</p><p>`true` for thin provisioning.</p><p>`false` for thick provisioning.</p>|`true`|


**Procedure**

1. Create a YAML config `sc.yaml` and configure the parameters as needed.

    ```yaml
    # Source: sc.yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-example-sc 
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Delete # Specify the reclaim policy.
    allowVolumeExpansion: true 
    parameters:
      # Specify the filesystem type, including "ext4", "ext3", "ext2", and "xfs".
      csi.storage.k8s.io/fstype: "ext4"
      # Specify the replication factor, either "2" or "3".
      replicaFactor: "2"
      # Specify the provisioning type.
      thinProvision: "true"
    volumeBindingMode: Immediate
    ```

2. Apply the YAML config to create the StorageClass.

    ```
    kubectl apply -f sc.yaml 
    ```

3. View the newly created StorageClass. 

    ```
    kubectl get storageclass iomesh-example-sc
    ```
   After running the command, you should see an example like:
    ```output
    NAME                  PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
    iomesh-example-sc     com.iomesh.csi-driver   Delete          Immediate           true                   24h
    ```
